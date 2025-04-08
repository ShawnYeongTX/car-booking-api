// const express = require("express");
// const cors = require("cors");
// require("dotenv").config();
// const app = express();
// app.use(cors());
// app.use(express.json()); // This allows parsing of JSON body

// // POST: Create a new booking
// app.post("/newbooking", async (req, res) => {
//   const client = await pool.connect();
//   try {
//     const {
//       car_id,
//       user_id,
//       start_date,
//       end_date,
//       name,
//       contact,
//       total_price,
//     } = req.body;

//     // Validate incoming data
//     if (
//       !car_id ||
//       !user_id ||
//       !start_date ||
//       !end_date ||
//       !name ||
//       !contact ||
//       !total_price
//     ) {
//       return res.status(400).json({
//         message:
//           "All fields are required: car_id, user_id, start_date, end_date, name, contact, total_price",
//       });
//     }

//     const query = `
//       INSERT INTO bookings (car_id, user_id, start_date, end_date, total_price, name, contact)
//       VALUES ($1, $2, $3, $4, $5, $6, $7)
//       RETURNING id, car_id, user_id, start_date, end_date, total_price, name, contact
//     `;
//     const params = [
//       car_id,
//       user_id,
//       start_date,
//       end_date,
//       total_price,
//       name,
//       contact,
//     ];

//     const result = await client.query(query, params);

//     // Send a success response with the newly created booking data
//     res.status(201).json({
//       status: "success",
//       data: result.rows[0], // Return the newly created booking data
//       message: "Booking created successfully",
//     });
//   } catch (error) {
//     console.error("Error: ", error.message);
//     res.status(500).json({ error: error.message });
//   } finally {
//     client.release();
//   }
// });

// // GET: Show a booking by ID
// app.get("/booking/:user_id", async (req, res) => {
//   const client = await pool.connect();
//   try {
//     const userId = req.params.user_id;
//     const query = `
//       SELECT
//         b.*,
//         c.make,
//         c.model,
//         c.year,
//         c.price_per_day
//       FROM bookings AS b
//       JOIN cars AS c ON b.car_id = c.id
//       WHERE b.user_id = $1
//     `;
//     const result = await client.query(query, [userId]);

//     if (result.rows.length === 0) {
//       return res.status(404).json({ message: "Booking not found" });
//     }
//     const bookings = result.rows.map((row) => ({
//       id: row.id,
//       car_id: row.car_id,
//       user_id: row.user_id,
//       start_date: row.start_date,
//       end_date: row.end_date,
//       total_price: row.total_price,
//       name: row.name,
//       contact: row.contact,
//       car_details: {
//         id: row.car_id,
//         make: row.make,
//         model: row.model,
//         year: row.year,
//         price_per_day: row.price_per_day,
//       },
//     }));

//     res.status(200).json({
//       status: "success",
//       data: bookings,
//       message: "Booking fetched successfully",
//     });
//   } catch (error) {
//     console.error("Error: ", error.message);
//     res.status(500).json({ error: error.message });
//   } finally {
//     client.release();
//   }
// });

// // PUT: Edit a booking by ID
// app.put("/booking/:id", async (req, res) => {
//   const client = await pool.connect();
//   try {
//     const bookingId = req.params.id;
//     const { start_date, end_date, name, contact, total_price } = req.body;

//     // Check if the booking exists
//     const checkQuery = "SELECT * FROM bookings WHERE id = $1";
//     const checkResult = await client.query(checkQuery, [bookingId]);

//     if (checkResult.rows.length === 0) {
//       return res.status(404).json({ message: "Booking not found" });
//     }

//     // Update the booking
//     const query = `
//       UPDATE bookings
//       SET start_date = $1, end_date = $2, name = $3, contact = $4, total_price = $5
//       WHERE id = $6
//       RETURNING id, start_date, end_date, name, contact, total_price
//     `;
//     const params = [
//       start_date,
//       end_date,
//       name,
//       contact,
//       total_price,
//       bookingId,
//     ];

//     const result = await client.query(query, params);

//     res.status(200).json({
//       status: "success",
//       data: result.rows[0],
//       message: "Booking updated successfully",
//     });
//   } catch (error) {
//     console.error("Error: ", error.message);
//     res.status(500).json({ error: error.message });
//   } finally {
//     client.release();
//   }
// });

// // DELETE: Delete a booking by ID
// app.delete("/booking/:id", async (req, res) => {
//   const client = await pool.connect();
//   try {
//     const bookingId = req.params.id;
//     const query = "SELECT * FROM bookings WHERE id = $1";
//     const checkResult = await client.query(query, [bookingId]);

//     if (checkResult.rows.length === 0) {
//       return res.status(404).json({ message: "Booking not found" });
//     }

//     // Delete the booking
//     const deleteQuery = "DELETE FROM bookings WHERE id = $1";
//     await client.query(deleteQuery, [bookingId]);

//     res.status(200).json({
//       status: "success",
//       message: "Booking deleted successfully",
//     });
//   } catch (error) {
//     console.error("Error: ", error.message);
//     res.status(500).json({ error: error.message });
//   } finally {
//     client.release();
//   }
// });

// // Serve the home page (index.html)
// app.get("/", (req, res) => {
//   res.send("Express API is now running");
// });

// // Start the server
// app.listen(3000, () => {
//   console.log("App is listening on port 3000");
// });

const express = require("express");
const cors = require("cors");
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Express API is running");
});

app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});
