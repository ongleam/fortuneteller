import { motion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";

export const Greeting = () => {
  const isMobile = useIsMobile();

  return (
    <div
      key="overview"
      className="mx-auto flex size-full max-w-3xl flex-col justify-center px-4 sm:px-8 md:mt-20"
    >
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ delay: 0.5 }}
        className={`${isMobile ? "text-xl" : "text-2xl"} font-semibold`}
      >
        Hello!
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ delay: 0.6 }}
        className={`${isMobile ? "text-lg" : "text-2xl"} text-zinc-500`}
      >
        {`Ask me anything about Korean visa :)`}
      </motion.div>
    </div>
  );
};
