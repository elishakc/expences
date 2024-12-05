const model = require("../models/model");

// POST: http://localhost:8080/api/categories
async function create_Categories(req, res) {
  try {
    const Create = new model.Categories({
      type: "Investment",
      color: "#FCBE44",
    });

    const savedCategory = await Create.save();
    return res.json(savedCategory);
  } catch (err) {
    return res
      .status(400)
      .json({ message: `Error while creating categories: ${err.message}` });
  }
}

// GET: http://localhost:8080/api/categories
async function get_Categories(req, res) {
  try {
    let data = await model.Categories.find({});
    let filter = data.map((v) => ({ type: v.type, color: v.color }));
    return res.json(filter);
  } catch (err) {
    return res
      .status(500)
      .json({ message: `Error while fetching categories: ${err.message}` });
  }
}

// POST: http://localhost:8080/api/transaction
async function create_Transaction(req, res) {
  if (!req.body) {
    return res.status(400).json("Post HTTP Data not Provided");
  }

  let { name, type, amount } = req.body;

  try {
    const create = new model.Transaction({
      name,
      type,
      amount,
      date: new Date(),
    });

    const savedTransaction = await create.save();
    return res.json(savedTransaction);
  } catch (err) {
    return res
      .status(400)
      .json({ message: `Error while creating transaction: ${err.message}` });
  }
}

// GET: http://localhost:8080/api/transaction
async function get_Transaction(req, res) {
  try {
    let data = await model.Transaction.find({});
    return res.json(data);
  } catch (err) {
    return res
      .status(500)
      .json({ message: `Error while fetching transactions: ${err.message}` });
  }
}

// DELETE: http://localhost:8080/api/transaction
async function delete_Transaction(req, res) {
  if (!req.body) {
    return res.status(400).json({ message: "Request body not Found" });
  }

  try {
    const { _id } = req.body;
    if (!_id) {
      return res.status(400).json({ message: "Transaction ID is required" });
    }
    await model.Transaction.deleteOne({ _id });
    return res.json("Record Deleted!");
  } catch (err) {
    return res.status(400).json({
      message: `Error while deleting Transaction Record: ${err.message}`,
    });
  }
}

// GET: http://localhost:8080/api/labels
async function get_Labels(req, res) {
  try {
    const result = await model.Transaction.aggregate([
      {
        $lookup: {
          from: "categories",
          localField: "type",
          foreignField: "type",
          as: "categories_info",
        },
      },
      {
        $unwind: {
          path: "$categories_info",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $group: {
          _id: {
            transactionId: "$_id",
            type: "$type",
            name: "$name",
            amount: "$amount",
            color: "$categories_info.color",
            date: "$date",
          },
        },
      },
      {
        $project: {
          _id: "$_id.transactionId",
          name: "$_id.name",
          type: "$_id.type",
          amount: "$_id.amount",
          color: "$_id.color",
          date: "$_id.date",
        },
      },
      {
        $sort: { date: -1 },
      },
    ]);

    return res.json(result);
  } catch (err) {
    return res
      .status(400)
      .json({ message: `Lookup Collection Error: ${err.message}` });
  }
}

module.exports = {
  create_Categories,
  get_Categories,
  create_Transaction,
  get_Transaction,
  delete_Transaction,
  get_Labels,
};
