import mongoose from "mongoose";
import Booking from "../../models/Booking.js";
import WorkforceCapacity from "../../models/WorkforceCapacity.js";
import User from "../../models/User.js";
import errorHandler from "../../errorHandler/errorHandler.js";

const createBooking = async (req, res, next) => {
  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      const userId = req.user.id;

      const {
        partnerId,
        workers,
        workerDetails,
        address,
        contactName,
        contactPhone,
        mealsProvided,
        travelCharges,
        paymentMethod,
        notes,
      } = req.body;

      // BASIC VALIDATION
      if (!partnerId) {
        throw errorHandler(400, "Partner is required");
      }

      if (!address || !contactName || !contactPhone) {
        throw errorHandler(400, "Address and contact details are required");
      }

      // GET PARTNER
      const partner = await User.findById(partnerId).session(session);

      if (!partner) {
        throw errorHandler(404, "Partner not found");
      }

      let labourCost = 0;
      let workerSnapshots = [];
      let finalWorkerDetails = null;

      
      if (partner.role === "connector") {
        if (!workers || workers.length === 0) {
          throw errorHandler(400, "Workers are required");
        }

        for (const w of workers) {
          if (!w.worker || !w.count) {
            throw errorHandler(400, "Worker and count required");
          }

          // ATOMIC UPDATE (NO RACE CONDITION)
          const updatedWorker = await WorkforceCapacity.findOneAndUpdate(
            {
              _id: w.worker,
              count: { $gte: w.count }, // critical condition
            },
            {
              $inc: { count: -w.count }, // reduce inventory
            },
            {
              new: true,
              session,
            }
          );

          // If failed → not enough workers OR race condition hit
          if (!updatedWorker) {
            throw errorHandler(
              400,
              `Only limited ${w.skill || "workers"} available`
            );
          }

          // Cost calculation (trusted DB values only)
          labourCost += w.count * updatedWorker.wage;

          // Snapshot (VERY IMPORTANT)
          workerSnapshots.push({
            worker: updatedWorker._id,
            skill: updatedWorker.skill,
            wage: updatedWorker.wage,
            count: w.count,
          });
        }
      }

      
      if (partner.role === "worker") {
        if (!workerDetails || !workerDetails.skill) {
          throw errorHandler(400, "Worker skill required");
        }

        const skillMatch = partner.skills.find(
          (s) => s.name === workerDetails.skill
        );

        if (!skillMatch) {
          throw errorHandler(400, "Skill not found");
        }

        labourCost = skillMatch.wage;

        finalWorkerDetails = {
          skill: skillMatch.name,
          wage: skillMatch.wage,
          experience: skillMatch.experience,
        };
      }

      const commissionRate =
        partner.role === "connector" ? partner.commissionRate : 0;

      const commission = (labourCost * commissionRate) / 100;
      const finalTravel = Number(travelCharges || 0);

      const totalAmount = labourCost + commission + finalTravel;

    
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const booking = await Booking.create(
        [
          {
            userId,
            partnerId,
            partnerName: partner.name,

            workers: partner.role === "connector" ? workerSnapshots : [],
            workerDetails:
              partner.role === "worker" ? finalWorkerDetails : null,

            address,
            contactName,
            contactPhone,
            mealsProvided: mealsProvided || false,

            travelCharges: finalTravel,
            labourCost,
            commission,
            totalAmount,

            paymentMethod,
            notes,

            workDate: today, // always today
            status: "pending",
          },
        ],
        { session }
      );

      res.status(201).json({
        success: true,
        message: "Booking created successfully",
        booking: booking[0],
      });
    });
  } catch (error) {
    next(error);
  } finally {
    session.endSession();
  }
};

export default createBooking;