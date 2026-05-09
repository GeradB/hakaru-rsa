import { Link } from 'react-router-dom';
import { useSiteContent } from '../context/SiteContentContext';

export default function Projects() {
  const siteContent = useSiteContent();
  const pp = siteContent.projectsPage || {};
  const projects = pp.items || [];

  const getStatusColor = (status) => {
    switch (status) {
      case 'annual': return 'bg-rsa-gold text-rsa-navy';
      case 'ongoing': return 'bg-green-600 text-white';
      case 'planning': return 'bg-blue-600 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'annual': return 'Annual Event';
      case 'ongoing': return 'Ongoing';
      case 'planning': return 'Planning';
      default: return status;
    }
  };

  const missionImg = pp.missionImageUrl?.trim?.();

  return (
    <div className="bg-gradient-to-b from-rsa-navy via-slate-800 to-rsa-navy min-h-screen py-16">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl md:text-5xl font-bold font-heading text-white mb-4 text-center leading-tight">
          {pp.pageTitle || 'Community Projects'}
        </h1>
        <p className="text-lg md:text-xl text-gray-300 text-center mb-12 max-w-2xl mx-auto">
          {pp.pageSubtitle || 'Making a difference in Hakaru and beyond'}
        </p>

        <div className="bg-white/95 backdrop-blur rounded-2xl shadow-2xl overflow-hidden mb-12 text-center">
          {missionImg ? (
            <img src={missionImg} alt="" className="w-full max-h-64 object-cover" />
          ) : null}
          <div className="p-8">
            <h2 className="text-2xl font-bold font-heading text-rsa-navy mb-4">
              {pp.missionTitle || 'Our Commitment to Community'}
            </h2>
            <p className="text-gray-700 leading-relaxed max-w-3xl mx-auto">
              {pp.missionBody ||
                'The Hakaru & Districts RSA is dedicated to serving our veterans and community.'}
            </p>
          </div>
        </div>

        <h2 className="text-2xl font-bold font-heading text-white mb-6">Current Projects</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {projects.map((project) => (
            <div
              key={project.id}
              className="bg-white/95 backdrop-blur rounded-xl shadow-xl overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
            >
              {project.imageUrl?.trim?.() ? (
                <img
                  src={project.imageUrl.trim()}
                  alt=""
                  className="h-40 w-full object-cover"
                />
              ) : null}
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <span className="text-4xl" aria-hidden="true">{project.emoji}</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(project.status)}`}>
                    {getStatusLabel(project.status)}
                  </span>
                </div>
                <h3 className="text-xl font-bold font-heading text-rsa-navy mb-3">
                  {project.title}
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {project.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-rsa-gold rounded-2xl shadow-2xl p-8 md:p-12 text-center">
          <h2 className="text-2xl md:text-3xl font-bold font-heading text-rsa-navy mb-4">
            {pp.getInvolvedTitle || 'Get Involved'}
          </h2>
          <p className="text-rsa-navy/80 mb-8 max-w-xl mx-auto leading-relaxed">
            {pp.getInvolvedBody ||
              'We welcome volunteers and supporters for all our projects.'}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/contact"
              className="inline-flex items-center bg-rsa-navy text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-slate-800 transition-all hover:scale-105"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Contact Us
            </Link>
            <Link
              to="/membership/become"
              className="inline-flex items-center border-2 border-rsa-navy text-rsa-navy px-8 py-4 rounded-lg font-bold text-lg hover:bg-rsa-navy hover:text-white transition-all"
            >
              Become a Member
            </Link>
          </div>
        </div>

        <div className="mt-16">
          <h2 className="text-2xl font-bold font-heading text-white mb-6">
            {pp.pastInitiativesTitle || 'Past Initiatives'}
          </h2>
          <div className="bg-white/95 backdrop-blur rounded-2xl shadow-xl p-8">
            <ul className="space-y-4">
              {(pp.pastInitiatives || []).map((item, i) => (
                <li key={i} className="flex items-start">
                  <svg className="w-6 h-6 text-rsa-gold mr-3 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <span className="font-bold text-rsa-navy">{item.title}</span>
                    <p className="text-gray-600 text-sm">{item.description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
