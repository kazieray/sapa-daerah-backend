const { GraphQLObjectType, GraphQLString, GraphQLList, GraphQLSchema, GraphQLID, GraphQLInt, GraphQLEnumType } = require("graphql");

const Report = require("../models/Report");

// Enum untuk status
const StatusEnum = new GraphQLEnumType({
   name: "Status",
   values: {
      BARU: { value: "baru" },
      DIPROSES: { value: "diproses" },
      SELESAI: { value: "selesai" },
      DITOLAK: { value: "ditolak" },
   },
});

// Enum untuk prioritas
const PriorityEnum = new GraphQLEnumType({
   name: "Priority",
   values: {
      RENDAH: { value: "rendah" },
      SEDANG: { value: "sedang" },
      TINGGI: { value: "tinggi" },
   },
});

// Timeline Type
const TimelineType = new GraphQLObjectType({
   name: "Timeline",
   fields: () => ({
      date: {
         type: GraphQLString,
         resolve: (timeline) => {
            // ✅ Ensure proper date formatting
            if (!timeline.date) return null;
            try {
               return new Date(timeline.date).toISOString();
            } catch (error) {
               console.error("Timeline date formatting error:", error);
               return null;
            }
         },
      },
      status: { type: StatusEnum },
      description: { type: GraphQLString },
      officer: { type: GraphQLString },
   }),
});

// Report Type
const ReportType = new GraphQLObjectType({
   name: "Report",
   fields: () => ({
      id: { type: GraphQLID },
      title: { type: GraphQLString },
      category: { type: GraphQLString }, // ✅ Changed to GraphQLString for flexibility
      priority: { type: PriorityEnum },
      status: { type: StatusEnum },
      location: { type: GraphQLString },
      description: { type: GraphQLString },
      reporter: { type: GraphQLString },
      reporterEmail: { type: GraphQLString },
      reporterUid: { type: GraphQLString },
      response: { type: GraphQLString },
      officer: { type: GraphQLString },
      officerEmail: { type: GraphQLString },
      images: { type: new GraphQLList(GraphQLString) },
      timeline: { type: new GraphQLList(TimelineType) },
      createdAt: {
         type: GraphQLString,
         resolve: (report) => {
            // ✅ Ensure proper date formatting for createdAt
            if (!report.createdAt) return null;
            try {
               return new Date(report.createdAt).toISOString();
            } catch (error) {
               console.error("CreatedAt date formatting error:", error);
               return null;
            }
         },
      },
      updatedAt: {
         type: GraphQLString,
         resolve: (report) => {
            // ✅ Ensure proper date formatting for updatedAt
            if (!report.updatedAt) return null;
            try {
               return new Date(report.updatedAt).toISOString();
            } catch (error) {
               console.error("UpdatedAt date formatting error:", error);
               return null;
            }
         },
      },
   }),
});

// Stats Type untuk dashboard
const StatsType = new GraphQLObjectType({
   name: "Stats",
   fields: () => ({
      total: { type: GraphQLInt },
      baru: { type: GraphQLInt },
      diproses: { type: GraphQLInt },
      selesai: { type: GraphQLInt },
      ditolak: { type: GraphQLInt },
   }),
});

// Query utama
const RootQuery = new GraphQLObjectType({
   name: "RootQueryType",
   fields: {
      // Get all reports with filters
      reports: {
         type: new GraphQLList(ReportType),
         args: {
            status: { type: GraphQLString },
            category: { type: GraphQLString }, // ✅ Changed to GraphQLString
            priority: { type: GraphQLString },
            location: { type: GraphQLString },
            search: { type: GraphQLString },
            reporterUid: { type: GraphQLString },
            limit: { type: GraphQLInt },
            offset: { type: GraphQLInt },
         },
         async resolve(parent, args) {
            try {
               const filter = {};

               // Apply filters with case-insensitive matching
               if (args.status && args.status !== "semua") {
                  filter.status = args.status.toLowerCase();
               }
               if (args.category && args.category !== "semua") {
                  filter.category = args.category.toLowerCase();
               }
               if (args.priority && args.priority !== "semua") {
                  filter.priority = args.priority.toLowerCase();
               }
               if (args.reporterUid) filter.reporterUid = args.reporterUid;

               // Search functionality
               if (args.search) {
                  filter.$or = [
                     { title: { $regex: args.search, $options: "i" } },
                     { location: { $regex: args.search, $options: "i" } },
                     { description: { $regex: args.search, $options: "i" } },
                     { reporter: { $regex: args.search, $options: "i" } },
                  ];
               }

               // Location filter
               if (args.location) {
                  filter.location = { $regex: args.location, $options: "i" };
               }

               let query = Report.find(filter).sort({ createdAt: -1 });

               // Pagination
               if (args.limit) query = query.limit(args.limit);
               if (args.offset) query = query.skip(args.offset);

               return await query;
            } catch (error) {
               console.error("GraphQL reports query error:", error);
               throw new Error("Gagal mengambil data laporan");
            }
         },
      },

      // Get report by ID
      report: {
         type: ReportType,
         args: { id: { type: GraphQLID } },
         async resolve(parent, args) {
            try {
               return await Report.findById(args.id);
            } catch (error) {
               console.error("GraphQL report query error:", error);
               throw new Error("Gagal mengambil data laporan");
            }
         },
      },

      // ✅ Fixed statistics query
      reportStats: {
         type: StatsType,
         args: {
            reporterUid: { type: GraphQLString },
         },
         async resolve(parent, args) {
            try {
               console.log("GraphQL reportStats called with args:", args);

               const filter = {};
               if (args.reporterUid) {
                  filter.reporterUid = args.reporterUid;
                  console.log("Filtering by reporterUid:", args.reporterUid);
               }

               console.log("Using filter:", filter);

               const [total, baru, diproses, selesai, ditolak] = await Promise.all([
                  Report.countDocuments(filter),
                  Report.countDocuments({ ...filter, status: "baru" }),
                  Report.countDocuments({ ...filter, status: "diproses" }),
                  Report.countDocuments({ ...filter, status: "selesai" }),
                  Report.countDocuments({ ...filter, status: "ditolak" }),
               ]);

               const result = { total, baru, diproses, selesai, ditolak };
               console.log("GraphQL stats result:", result);

               return result;
            } catch (error) {
               console.error("GraphQL stats query error:", error);
               throw new Error("Gagal mengambil statistik laporan");
            }
         },
      },
   },
});

module.exports = new GraphQLSchema({ query: RootQuery });