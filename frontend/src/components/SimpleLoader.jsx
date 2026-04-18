const SimpleLoader = ({ text = "Loading..." }) => {
  return (
    <div className="flex flex-col items-center justify-center px-5">
      <div className="w-10 h-10 border-4 border-gray-300 border-t-orange-500 rounded-full animate-spin"></div>
      <p className="mt-4 text-sm text-gray-600">{text}</p>
    </div>
  );
};

export default SimpleLoader;