// components/BentoGrid.tsx

import GlassCard from "@/GlassCard";
import MagneticButton from "@/Cursor";

export default function BentoGrid() {
  return (
    <div className="grid grid-cols-3 gap-4">
      
      {/* Big Analytics */}
      <GlassCard className="col-span-2 row-span-2 float">
        <h2 className="text-xl font-bold mb-2">Analytics</h2>
        <div className="h-40 bg-gradient-to-r from-purple-500 to-pink-500 animate-gradient rounded-xl" />
      </GlassCard>

      {/* Orders */}
      <GlassCard>
        <p>Orders</p>
        <h2 className="text-2xl">320</h2>
      </GlassCard>

      {/* Users */}
      <GlassCard>
        <p>Users</p>
        <h2 className="text-2xl">1.2K</h2>
      </GlassCard>

      {/* CTA */}
      <GlassCard className="col-span-3 flex justify-center">
        <MagneticButton>Upgrade Plan 🚀</MagneticButton>
      </GlassCard>
    </div>
  );
}