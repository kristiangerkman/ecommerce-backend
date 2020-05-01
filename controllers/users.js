const bcrypt = require("bcrypt");
const usersRouter = require("express").Router();
const User = require("../models/user");

//get all users;
usersRouter.get("/", async (req, res) => {
  const users = await User.find({});
  res.json(users.map((u) => u.toJSON()));
});

//get user by id
usersRouter.get("/:id", async (req, res) => {
  const user = await User.findById(req.params.id)
    .populate({
      path: "orders",
      select: "payment products status",
      populate: {
        path: "products",
        model: "Product",
        select: "info name",
      },
    })
    .populate("shoppingcart", { name: 1, info: 1 });
  res.json(user.toJSON());
});

usersRouter.put("/:id/editshoppingcart", async (req, res) => {
  const body = req.body;
  await User.findByIdAndUpdate(
    req.params.id,
    { shoppingcart: [...body.products] },
    { new: true }
  );
});

//create new user / register
usersRouter.post("/", async (req, res) => {
  const body = req.body;

  if (body.password.length < 4) {
    return res
      .status(400)
      .json({ error: "Password must be over 3 characters long" });
  }

  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(body.password, saltRounds);

  const user = new User({
    username: body.username,
    name: body.name,
    email: body.email,
    passwordHash,
  });

  const savedUser = await user.save();

  res.json(savedUser);
});

module.exports = usersRouter;
