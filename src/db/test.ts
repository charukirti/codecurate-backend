import "dotenv/config";
import { db } from "./index";
import { users } from "./schema";

async function test() {
  // insert new user
  const newUser = await db
    .insert(users)
    .values({
      name: "john doe",
      username: "johndon",
      email: "johndoe@gmail.com",
      password: "hashedpassword1234",
    })
    .returning();

  console.log("Created new user", newUser);

  // query users
  const allUsers = await db.query.users.findMany();
  console.log("I got all users", allUsers);
}

test()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Test failed", err), process.exit(1);
  });
