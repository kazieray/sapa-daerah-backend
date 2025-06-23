const admin = require("firebase-admin");
const serviceAccount = require("../firebase-credentials.json");

// Initialize Firebase Admin only once
if (!admin.apps.length) {
   admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
   });
}

const verifyFirebaseToken = async (req, res, next) => {
   try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
         return res.status(401).json({
            success: false,
            error: "Token Firebase tidak ditemukan",
         });
      }

      const idToken = authHeader.split(" ")[1];

      if (!idToken) {
         return res.status(401).json({
            success: false,
            error: "Token Firebase tidak valid",
         });
      }

      // Verify the Firebase ID token
      const decoded = await admin.auth().verifyIdToken(idToken);

      // Get additional user info from Firebase Auth
      const userRecord = await admin.auth().getUser(decoded.uid);

      req.firebaseUser = {
         uid: decoded.uid,
         email: decoded.email,
         name: userRecord.displayName || decoded.name || "User",
         displayName: userRecord.displayName || decoded.name || "User",
         emailVerified: decoded.email_verified,
      };

      next();
   } catch (err) {
      console.error("Firebase token verification error:", err);
      res.status(401).json({
         success: false,
         error: "Token Firebase tidak valid",
         details: process.env.NODE_ENV !== "production" ? err.message : undefined,
      });
   }
};

module.exports = verifyFirebaseToken;