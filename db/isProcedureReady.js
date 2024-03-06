const { name } = require("body-parser");
const client = require("./db");

async function procedureReady() {
  try {
    const procedureQueries = [
      {
        name: "insert_class",
        query: `
        CREATE OR REPLACE PROCEDURE insert_class(
            IN input_name VARCHAR(255),
            IN input_description VARCHAR(1000)
          )
          LANGUAGE plpgsql
          AS $$
          BEGIN
            INSERT INTO classes (name, description) VALUES (input_name, input_description);
          END;
          $$;
        `,
      },
      {
        name: "get_classes",
        query: ` CREATE OR REPLACE FUNCTION get_classes()
                 RETURNS TABLE ( id INT, name VARCHAR(255),description VARCHAR(1000)  )
        LANGUAGE plpgsql
        AS $$
        BEGIN
        RETURN QUERY SELECT * FROM classes;
        END;
        $$;
     `,
      },
      {
        name: "delete_class",
        query: `
        CREATE OR REPLACE PROCEDURE delete_class(
          IN class_id INT
          )
          LANGUAGE plpgsql
          AS $$
          BEGIN
            DELETE FROM classes WHERE id = class_id ;
          END;
          $$;
        `,
      },
      {
        name: "insert_types",
        query: `
        CREATE OR REPLACE PROCEDURE insert_types(
            IN input_class_id INT,
            IN input_name VARCHAR(255),
            IN input_description VARCHAR(1000)
          )
          LANGUAGE plpgsql
          AS $$
          BEGIN
            INSERT INTO types (class_id,name, description) VALUES (input_class_id,input_name, input_description);
          END;
          $$;
        `,
      },
      {
        name: "get_types",
        query: `
        CREATE OR REPLACE FUNCTION get_types(
          IN input_class_id INT
      )
      RETURNS TABLE ( id INT, class_id INT, name VARCHAR(255), description VARCHAR(1000) )
      LANGUAGE plpgsql
      AS $$
      BEGIN
          RETURN QUERY SELECT * FROM types WHERE types.class_id = input_class_id;
      END;
      $$;      
        `,
      },
      {
        name: "insert_image",
        query: `
          CREATE OR REPLACE PROCEDURE insert_image(
            IN input_id VARCHAR(255),
            IN input_image VARCHAR(255)
          )
          LANGUAGE plpgsql
          AS $$
          BEGIN
            INSERT INTO images (image_id, image) VALUES (input_id, input_image);
          END;
          $$;
        `,
      },
      {
        name: "insert_blog",
        query: `
          CREATE OR REPLACE PROCEDURE insert_blog(
            IN input_id VARCHAR(255),
            IN input_description VARCHAR(1000),
            IN input_date VARCHAR(255)
          )
          LANGUAGE plpgsql
          AS $$
          BEGIN
            INSERT INTO blogs (id, description, date) VALUES (input_id, input_description, input_date);
          END;
          $$;
        `,
      },
      {
        name: "get_blogs",
        query: `
          CREATE OR REPLACE FUNCTION get_blogs()
          RETURNS TABLE (id VARCHAR(255), description VARCHAR(1000), date VARCHAR(255),image VARCHAR(255))
          LANGUAGE plpgsql
          AS $$
          BEGIN
            RETURN QUERY SELECT b.id, b.description, b.date, i.image
            FROM blogs b
            INNER JOIN images i ON b.id = i.image_id;
          END;
          $$;
        `,
      },
      {
        name: "delete_blog",
        query: `
          CREATE OR REPLACE PROCEDURE delete_blog(
            IN input_id VARCHAR(255)
          )
          LANGUAGE plpgsql
          AS $$
          BEGIN
            DELETE FROM blogs WHERE id = input_id ;
          END;
          $$;
        `,
      },
      {
        name: "insert_trip",
        query: `
        CREATE OR REPLACE PROCEDURE insert_trip(
          IN input_id VARCHAR(255),
          IN input_price INT,
          IN input_vehicle VARCHAR(300),
          IN input_name VARCHAR(300),
          IN input_gudinjg VARCHAR(300),
          IN input_duration VARCHAR(300),
          IN input_description VARCHAR(1500),
          IN input_image VARCHAR(300)
        )
        LANGUAGE plpgsql
        AS $$
        DECLARE
          trip_id INT;
        BEGIN
          INSERT INTO trips (id, price, name, vehicle, duration, gudinjg, description, image)
          VALUES (input_id, input_price, input_name, input_vehicle, input_duration, input_gudinjg, input_description, input_image);
        END;
        $$;
        `
      },
      {
        name: "update_trip",
        query: `
        CREATE OR REPLACE FUNCTION update_trip ( 
          IN input_trip_id VARCHAR(255),
          IN input_price INT,
          IN input_vehicle VARCHAR(300),
          IN input_name VARCHAR(300),
          IN input_guiding VARCHAR(300),
          IN input_duration VARCHAR(300),
          IN input_description VARCHAR(1500)
      )
      RETURNS VOID
      LANGUAGE plpgsql
      AS $$
      BEGIN
          UPDATE trips 
          SET 
              price = input_price,
              vehicle = input_vehicle, -- Corrected the column name from 'vechicle' to 'vehicle'
              name = input_name,
              gudinjg = input_guiding,
              duration = input_duration,
              description = input_description
          WHERE id = input_trip_id;
      
          IF FOUND THEN
              RETURN;
          ELSE
              RAISE EXCEPTION 'Trip with id % not found', input_trip_id;
          END IF;
      END;
      $$;              
        `
      },
      {
        name: "get_trips",
        query: `
        CREATE OR REPLACE FUNCTION get_trips()
        RETURNS TABLE (
            id VARCHAR(255),
            name VARCHAR(300),
            price INT,
            vehicle VARCHAR(300), -- Corrected the column name from 'vechicle' to 'vehicle'
            gudinjg VARCHAR(300),
            duration VARCHAR(300),
            description VARCHAR(1500),
            image VARCHAR(300)
        )
        AS $$
        BEGIN
            RETURN QUERY
            SELECT 
                trips.id,
                trips.name,
                trips.price,
                trips.vehicle, -- Corrected the column name from 'vechicle' to 'vehicle'
                trips.gudinjg,
                trips.duration,
                trips.description,
                trips.image 
            FROM 
                trips;
        END;
        $$ LANGUAGE plpgsql;        
        `
      }, 
      
      {
        name: "trips_names",
        query: `
        CREATE OR REPLACE FUNCTION trips_names()
        RETURNS TABLE (
            id VARCHAR(255),
            name VARCHAR(300)
        )
        AS $$
        BEGIN
            RETURN QUERY
            SELECT 
                trips.id,
                trips.name
            FROM 
                trips;
        END;
        $$ LANGUAGE plpgsql;         
        `
      },
      {
        name: "get_trip",
        query: `
        CREATE OR REPLACE FUNCTION get_trip(
          IN input_trip_id VARCHAR(255)
        )
        RETURNS TABLE (
          id VARCHAR(255),
          name VARCHAR(300),
          price INT,
          vehicle VARCHAR(300), 
          gudinjg VARCHAR(300),
          duration VARCHAR(300),
          description VARCHAR(1500),
          image VARCHAR(300) 
        )
        AS $$
        BEGIN
            RETURN QUERY
            SELECT 
                trips.id,
                trips.name,
                trips.price,
                trips.vehicle,
                trips.gudinjg,
                trips.duration,
                trips.description,
                trips.image 
            FROM 
                trips 
            WHERE   
                trips.id = input_trip_id; -- Added semicolon at the end of the WHERE clause
        END;
        $$ LANGUAGE plpgsql;
         
        `
      },
      {
        name: "Search",
        query: `
        CREATE OR REPLACE FUNCTION Search(
          IN input_name VARCHAR(300)
        )
        RETURNS TABLE (
            id VARCHAR(255),
            name VARCHAR(300),
            price INT,
            vehicle VARCHAR(300), -- Corrected the column name from 'vechicle' to 'vehicle'
            gudinjg VARCHAR(300),
            duration VARCHAR(300),
            description VARCHAR(1500),
            image VARCHAR(300) 
        )
        AS $$
        BEGIN
            RETURN QUERY
            SELECT 
                trips.id,
                trips.name,
                trips.price,
                trips.vehicle, -- Corrected the column name from 'vechicle' to 'vehicle'
                trips.gudinjg, 
                trips.duration,
                trips.description,
                trips.image
            FROM 
                trips 
            WHERE   
                (input_name IS NULL OR trips.name LIKE '%' || input_name || '%'); -- Added semicolon at the end of the WHERE clause
        END;
        $$ LANGUAGE plpgsql;        
        `,
      },
      {
        name: "get_4_trips",
        query: `
        CREATE OR REPLACE FUNCTION get_4_trips()
        RETURNS TABLE (
            id VARCHAR(255),
            name VARCHAR(300),
            price INT,
            vehicle VARCHAR(300), -- Corrected the column name from 'vechicle' to 'vehicle'
            gudinjg VARCHAR(300),
            duration VARCHAR(300),
            description VARCHAR(1500),
            image VARCHAR(300)
        )
        AS $$
        BEGIN
            RETURN QUERY
            SELECT 
                trips.id,
                trips.name,
                trips.price,
                trips.vehicle, -- Corrected the column name from 'vechicle' to 'vehicle'
                trips.gudinjg,
                trips.duration,
                trips.description,
                trips.image
            FROM 
                trips 
            ORDER BY 
                RANDOM()
            LIMIT 
                4;
        END;
        $$ LANGUAGE plpgsql;        
        `,
      },
      {
        name: "get_3_trips",
        query: `
        CREATE OR REPLACE FUNCTION get_3_trips()
        RETURNS TABLE (
            id VARCHAR(255),
            name VARCHAR(300),
            price INT,
            vehicle VARCHAR(300), -- Corrected the column name from 'vechicle' to 'vehicle'
            gudinjg VARCHAR(300),
            duration VARCHAR(300),
            description VARCHAR(1500),
            image VARCHAR(300)
        )
        AS $$
        BEGIN
            RETURN QUERY
            SELECT 
                trips.id,
                trips.name,
                trips.price,
                trips.vehicle, -- Corrected the column name from 'vechicle' to 'vehicle'
                trips.gudinjg,
                trips.duration,
                trips.description,
                trips.image
            FROM 
                trips 
            ORDER BY 
                RANDOM()
            LIMIT 
                3;
        END;
        $$ LANGUAGE plpgsql;
        `,
      },
      {
        name: "delete_trip",
        query: `
        CREATE OR REPLACE PROCEDURE delete_trip(IN input_trip_id VARCHAR(255))
        LANGUAGE plpgsql
        AS $$
        BEGIN
            DELETE FROM trips WHERE id = input_trip_id;
        END;
        $$;        
        `,
      },

       {
        name: "insert_contactus",
        query: `CREATE OR REPLACE PROCEDURE insert_contactus(
          in_name VARCHAR(255),
          in_mail VARCHAR(255),
          in_description VARCHAR(600)
      )
      LANGUAGE plpgsql
      AS $$
      BEGIN
          INSERT INTO contactus (name, mail, description)
          VALUES (in_name, in_mail, in_description);
      END;
      $$;
      `,
      },
      {
        name: "get_contactus",
        query: `CREATE OR REPLACE FUNCTION  get_contactus()
        RETURNS TABLE(
          id INT,
          name VARCHAR(255),
          mail VARCHAR(255),
          description VARCHAR(600)
      )
      AS $$
      BEGIN
          RETURN QUERY SELECT * FROM contactus;
      END;
      $$
      LANGUAGE plpgsql;
      `,
      },
      {
        name: "delete_contactus",
        query: `CREATE OR REPLACE PROCEDURE delete_contactus(
          in_id INT
      )
      LANGUAGE plpgsql
      AS $$
      BEGIN
          DELETE FROM contactus WHERE id = in_id;
      END;
      $$;
      `,
      },
      {
        name: "register",
        query: `
          CREATE OR REPLACE FUNCTION register(
            IN input_name VARCHAR(255),
            IN input_mail VARCHAR(255),
            IN input_pass VARCHAR(255)
          )
          RETURNS INTEGER
          LANGUAGE plpgsql
          AS $$
          DECLARE
            new_id INTEGER;
          BEGIN
            INSERT INTO accounts (name, mail, pass) VALUES (input_name, input_mail, input_pass)
            RETURNING id INTO new_id;
            RETURN new_id;
          END;
          $$;
        `,
      },
      {
        name: "get_user",
        query: `
          CREATE OR REPLACE FUNCTION get_user(
            IN input_mail VARCHAR(255)
          )
          RETURNS TABLE (
            id INTEGER,
            name VARCHAR(255),
            mail VARCHAR(255),
            pass VARCHAR(255),
            role VARCHAR(255)
          )
          LANGUAGE plpgsql
          AS $$
          BEGIN
            RETURN QUERY
            SELECT a.id, a.name, a.mail, a.pass, a.role
            FROM accounts a
            WHERE a.mail = input_mail;
          END;
          $$;
        `,
      },
      {
        name: "insert_order",
        query: `
          CREATE OR REPLACE FUNCTION insert_order(
            IN p_user_id INT,
            IN p_name VARCHAR(255),
            IN p_trip_id INT,
            IN p_number_of_person INT,
            IN p_arrivaldate DATE,
            IN p_departuredate DATE,
            IN p_flight_number INT,
            IN p_hotel_name VARCHAR(255),
            IN p_room_name VARCHAR(255)
          )
          RETURNS INT
          LANGUAGE plpgsql
          AS $$
          DECLARE
            inserted_id INT;
          BEGIN
              INSERT INTO orders (user_id, name, trip_id, number_of_person, arrivaldate, departuredate, flight_number, hotel_name, room_name)
              VALUES (p_user_id, p_name, p_trip_id, p_number_of_person, p_arrivaldate, p_departuredate, p_flight_number, p_hotel_name, p_room_name)
              RETURNING id INTO inserted_id;
              
              RETURN inserted_id;
          END;
          $$;
        `
          },      
      {
        name: "get_paid_orders",
        query: `
          CREATE OR REPLACE FUNCTION get_paid_orders()
          RETURNS TABLE (
              order_id INT,
              user_id INT,
              order_name VARCHAR(255),
              trip_name VARCHAR(255),
              number_of_person INT,
              arrivaldate DATE,
              departuredate DATE,
              flight_number INT,
              hotel_name VARCHAR(255),
              room_name VARCHAR(255),
              paid BOOLEAN
          )
          LANGUAGE plpgsql
          AS $$
          BEGIN
              RETURN QUERY 
              SELECT o.id AS order_id, o.user_id, o.name AS order_name, t.name AS trip_name, o.number_of_person, o.arrivaldate, o.departuredate, o.flight_number, o.hotel_name, o.room_name, o.paid 
              FROM orders o 
              JOIN trips t ON o.trip_id = t.id  
              WHERE o.paid = TRUE;
          END;
          $$;
        `
      },
      
      {
        name: "paid_order",
        query: `
          CREATE OR REPLACE PROCEDURE paid_order(
            IN p_user_id INT,
            IN p_order_id INT
          )
          LANGUAGE plpgsql
          AS $$
          BEGIN
              UPDATE orders SET paid = TRUE WHERE orders.user_id = p_user_id AND orders.id = p_order_id;
          END;
          $$;
        `
      },
      {
        name: "check_total",
        query: `
          CREATE OR REPLACE FUNCTION check_total(
            IN p_user_id INT,
            IN p_order_id INT
          )
          RETURNS INT 
          LANGUAGE plpgsql
          AS $$
          DECLARE
            total INT;
          BEGIN
            SELECT o.number_of_person * t.price INTO total
            FROM orders o 
            JOIN trips t ON o.trip_id = t.id 
            WHERE o.id = p_order_id AND o.user_id = p_user_id;
            
            RETURN total;
          END;
          $$;
        `
      },       
      {
        name: "delete_order",
        query: `
          CREATE OR REPLACE PROCEDURE delete_order(
            IN p_order_id INT
          )
          LANGUAGE plpgsql
          AS $$
          BEGIN
              DELETE FROM orders WHERE orders.id = p_order_id;
          END;
          $$;
        `
      }
      
    ];

    let createdCount = 0;
    let skippedCount = 0;

    for (let i = 0; i < procedureQueries.length; i++) {
      const procedureQuery = procedureQueries[i];
      const procedureCheckQuery = `
        SELECT EXISTS (
          SELECT 1
          FROM information_schema.routines
          WHERE routine_name = $1
        );
      `;

      const { rows } = await client.query(procedureCheckQuery, [
        procedureQuery.name,
      ]);
      const procedureExists = rows[0].exists;

      if (procedureExists) {
        skippedCount++;
        console.log(
          `Procedure ${procedureQuery.name} already exists. Skipped creation.`
        );
      } else {
        await client.query(procedureQuery.query);
        createdCount++;
        console.log(`Procedure ${procedureQuery.name} created successfully!`);
      }
    }

    console.log(`${createdCount} procedures created successfully!`);
    console.log(`${skippedCount} procedures skipped as they already exist.`);
  } catch (error) {
    console.error("Error occurred:", error);
  }
}

module.exports = procedureReady;
