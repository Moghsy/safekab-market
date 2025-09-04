import { Spinner } from "@/components/ui/spinner";

const Loading = () => {
  return (
    <div className="w-full h-screen flex items-center justify-center">
      <Spinner variant="circle-filled" size={48} />
    </div>
  );
};

export default Loading;
