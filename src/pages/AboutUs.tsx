import SplineViewer from "@/components/SplineViewer";

const AboutUs = () => {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated background gradients with more violet */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 via-background to-purple-500/10" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

      {/* Full Screen Spline */}
      <div className="absolute inset-0 z-10">
        <SplineViewer 
          url="https://prod.spline.design/DcXzHKcAPU1AWPHo/scene.splinecode" 
          className="w-full h-full" 
        />
      </div>
    </div>
  );
};

export default AboutUs;