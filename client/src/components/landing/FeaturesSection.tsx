import React from 'react';

export const FeaturesSection: React.FC = () => {
  const features = [
    {
      step: '01',
      title: 'Automated Order Settlements',
      description: 'Track full and partial payments atomically with database row-locking and real-time balance calculations.',
      badgeColor: 'bg-indigo-100 text-indigo-600',
    },
    {
      step: '02',
      title: 'Real-Time Expiry Engine',
      description: 'Dynamic read-time overdue resolution with zero N+1 database queries for maximum performance.',
      badgeColor: 'bg-purple-100 text-purple-600',
    },
    {
      step: '03',
      title: 'Strict Multi-Tenant Security',
      description: 'JWT authentication middleware with user-isolated queries ensuring data privacy across every API endpoint.',
      badgeColor: 'bg-emerald-100 text-emerald-600',
    },
  ];

  return (
    <section className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8">
      {features.map((f) => (
        <div key={f.step} className="bg-white/70 backdrop-blur-md p-6 rounded-2xl border border-white/80 shadow-sm hover:shadow-md transition">
          <div className={`w-10 h-10 ${f.badgeColor} rounded-xl flex items-center justify-center mb-4 font-bold text-sm`}>
            {f.step}
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">{f.title}</h3>
          <p className="text-sm text-slate-600 leading-relaxed">{f.description}</p>
        </div>
      ))}
    </section>
  );
};
