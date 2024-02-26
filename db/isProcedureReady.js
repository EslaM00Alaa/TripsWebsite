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

      const { rows } = await client.query(procedureCheckQuery, [procedureQuery.name]);
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
