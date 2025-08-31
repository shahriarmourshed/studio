
'use client';
import PageHeader from '@/components/common/page-header';
import PlanVsActuals from '@/components/dashboard/plan-vs-actuals';

export default function PlanVsActualsPage() {
  return (
    <div className="container mx-auto">
      <PageHeader title="Plan vs. Actuals" subtitle="Compare your budget against your actuals." />
      
      <div className="px-4 sm:px-0">
        <PlanVsActuals />
      </div>
    </div>
  );
}
