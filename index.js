const express = require("express");
const cors = require("cors");
const app = express();
const PORT = process.env.PORT || 3000;
const DB_URL = process.env.DB_URL;
const { Pool } = require("pg");
app.use(cors({ origin: "*" }));
app.use(express.json()); // This allows parsing of JSON body

//specifying the connectionString for postgreSQL DB
const pool = new Pool({
  connectionString: DB_URL,
});

//try DB connection
pool
  .connect()
  .then((client) => {
    console.log("Connected to the databse");
    client.release();
  })
  .catch((err) => console.error("Database connection error:", err));

// POST: Create a new booking
app.post("/newbooking", async (req, res) => {
  const client = await pool.connect();
  try {
    const {
      car_id,
      user_id,
      start_date,
      end_date,
      name,
      contact,
      total_price,
    } = req.body;

    // Validate incoming data
    if (
      !car_id ||
      !user_id ||
      !start_date ||
      !end_date ||
      !name ||
      !contact ||
      !total_price
    ) {
      return res.status(400).json({
        message:
          "All fields are required: car_id, user_id, start_date, end_date, name, contact, total_price",
      });
    }

    const query = `
      INSERT INTO bookings (car_id, user_id, start_date, end_date, total_price, name, contact)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, car_id, user_id, start_date, end_date, total_price, name, contact
    `;
    const params = [
      car_id,
      user_id,
      start_date,
      end_date,
      total_price,
      name,
      contact,
    ];

    const result = await client.query(query, params);

    // Send a success response with the newly created booking data
    res.status(201).json({
      status: "success",
      data: result.rows[0], // Return the newly created booking data
      message: "Booking created successfully",
    });
  } catch (error) {
    console.error("Error: ", error.message);
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
});

// GET: Show a booking by ID
app.get("/booking/:user_id", async (req, res) => {
  const client = await pool.connect();
  try {
    const userId = req.params.user_id;
    const query = `
      SELECT
        b.*,
        c.make,
        c.model,
        c.year,
        c.price_per_day
      FROM bookings AS b
      JOIN cars AS c ON b.car_id = c.id
      WHERE b.user_id = $1
    `;
    const result = await client.query(query, [userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Booking not found" });
    }
    const bookings = result.rows.map((row) => ({
      id: row.id,
      car_id: row.car_id,
      user_id: row.user_id,
      start_date: row.start_date,
      end_date: row.end_date,
      total_price: row.total_price,
      name: row.name,
      contact: row.contact,
      car_details: {
        id: row.car_id,
        make: row.make,
        model: row.model,
        year: row.year,
        price_per_day: row.price_per_day,
      },
    }));

    res.status(200).json({
      status: "success",
      data: bookings,
      message: "Booking fetched successfully",
    });
  } catch (error) {
    console.error("Error: ", error.message);
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
});

// PUT: Edit a booking by ID
app.put("/booking/:id", async (req, res) => {
  const client = await pool.connect();
  try {
    const bookingId = req.params.id;
    const { start_date, end_date, name, contact } = req.body;

    // Check if the booking exists
    const checkQuery = "SELECT * FROM bookings WHERE id = $1";
    const checkResult = await client.query(checkQuery, [bookingId]);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Update the booking
    const query = `
    UPDATE bookings
    SET start_date = $1, end_date = $2, name = $3, contact = $4
    WHERE id = $5
    RETURNING id, start_date, end_date, name, contact
  `;
    const params = [start_date, end_date, name, contact, bookingId];

    const result = await client.query(query, params);

    res.status(200).json({
      status: "success",
      data: result.rows[0],
      message: "Booking updated successfully",
    });
  } catch (error) {
    console.error("Error: ", error.message);
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
});

// DELETE: Delete a booking by ID
app.delete("/booking/:id", async (req, res) => {
  const client = await pool.connect();
  try {
    const bookingId = req.params.id;
    const query = "SELECT * FROM bookings WHERE id = $1";
    const checkResult = await client.query(query, [bookingId]);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Delete the booking
    const deleteQuery = "DELETE FROM bookings WHERE id = $1";
    await client.query(deleteQuery, [bookingId]);

    res.status(200).json({
      status: "success",
      message: "Booking deleted successfully",
    });
  } catch (error) {
    console.error("Error: ", error.message);
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
});

// GET: Get car by car ID
app.get("/car", async (req, res) => {
  const client = await pool.connect();
  try {
    const carId = req.params.id;
    const query = `
      SELECT make, model, year, price_per_day
      FROM cars
      WHERE id = $1
    `;
    const result = await client.query(query, [carId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Car not found" });
    }

    const carData = result.rows[0];

    res.status(200).json({
      status: "success",
      data: {
        carId,
        make: carData.make,
        model: carData.model,
        year: carData.year,
        price_per_day: carData.price_per_day,
      },
      message: "Car details fetched successfully",
    });
  } catch (error) {
    console.error("Error: ", error.message);
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
});

// Serve the home page (index.html)
app.get("/", (req, res) => {
  res.send("Express API is now running");
});

app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});
