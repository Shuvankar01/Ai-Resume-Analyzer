import React from 'react';
import { motion } from 'framer-motion';
import PreviewHeader from './PreviewHeader';
import HealthMetricsCard from './HealthMetricsCard';
import ExecutiveSummaryCard from './ExecutiveSummaryCard';
import AtsMetricsCard from './AtsMetricsCard';
import SuggestedRolesCard from './SuggestedRolesCard';
import CategorizedSkillsCard from './CategorizedSkillsCard';
import StructureAndRecommendationsCard from './StructureAndRecommendationsCard';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export default function ResumePreviewDashboard({ previewData, onAction }) {
  if (!previewData) return null;

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={itemVariants}>
        <PreviewHeader 
          snapshot={previewData.snapshot} 
          metadata={previewData.metadata} 
          actions={previewData.actions} 
          onAction={onAction} 
        />
      </motion.div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <motion.div variants={itemVariants}>
            <ExecutiveSummaryCard 
              summary={previewData.summary} 
              interviewQuestions={previewData.interview_questions}
              learningRoadmap={previewData.learning_roadmap}
              careerGrowth={previewData.career_growth_suggestions}
            />
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <HealthMetricsCard health={previewData.health} />
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <CategorizedSkillsCard skills={previewData.skills} />
          </motion.div>
        </div>
        
        <div className="space-y-6">
          <motion.div variants={itemVariants}>
            <SuggestedRolesCard roles={previewData.roles} />
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <AtsMetricsCard ats={previewData.ats} risks={previewData.risks} />
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <StructureAndRecommendationsCard 
              sections={previewData.sections} 
              recommendations={previewData.recommendations}
              strengths={previewData.strengths}
              weaknesses={previewData.weaknesses}
            />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
