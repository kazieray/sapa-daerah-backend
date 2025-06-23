const mongoose = require("mongoose");
const Report = require("../models/Report");
const connectDB = require("../db");

const cleanupReportData = async () => {
   try {
      await connectDB();
      console.log("🔧 Starting data cleanup...");

      // Get all reports
      const reports = await Report.find({});
      console.log(`📊 Found ${reports.length} reports to process`);

      let updatedCount = 0;

      for (const report of reports) {
         let needsUpdate = false;
         const updates = {};

         // Normalize category to lowercase
         if (report.category && typeof report.category === "string") {
            const normalizedCategory = report.category.toLowerCase();
            if (report.category !== normalizedCategory) {
               updates.category = normalizedCategory;
               needsUpdate = true;
            }
         }

         // Normalize status to lowercase
         if (report.status && typeof report.status === "string") {
            const normalizedStatus = report.status.toLowerCase();
            if (report.status !== normalizedStatus) {
               updates.status = normalizedStatus;
               needsUpdate = true;
            }
         }

         // Normalize priority to lowercase
         if (report.priority && typeof report.priority === "string") {
            const normalizedPriority = report.priority.toLowerCase();
            if (report.priority !== normalizedPriority) {
               updates.priority = normalizedPriority;
               needsUpdate = true;
            }
         }

         // Update timeline status values
         if (report.timeline && report.timeline.length > 0) {
            const updatedTimeline = report.timeline.map((item) => ({
               ...item,
               status: item.status ? item.status.toLowerCase() : item.status,
            }));
            updates.timeline = updatedTimeline;
            needsUpdate = true;
         }

         if (needsUpdate) {
            await Report.findByIdAndUpdate(report._id, updates);
            updatedCount++;
            console.log(`✅ Updated report ${report._id}: ${report.title}`);
         }
      }

      console.log(`🎉 Data cleanup completed! Updated ${updatedCount} reports`);
      process.exit(0);
   } catch (error) {
      console.error("❌ Error during cleanup:", error);
      process.exit(1);
   }
};

// Run cleanup if this file is executed directly
if (require.main === module) {
   cleanupReportData();
}

module.exports = { cleanupReportData };