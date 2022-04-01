import { ObjectId } from "bson";
import express from "express";
import { getClient } from "../db";
import OrQuery from "../models/OrQuery";
import Query from "../models/Query";
// import QueryStringParamns from "../models/QueryStringParams";
import Shoutout from "../models/Shoutout";

const shoutoutRouter = express.Router();

const errorResponse = (error: any, res: any) => {
  console.error("FAIL", error);
  res.status(500).json({ message: "Internal Server Error" });
};

shoutoutRouter.get("/", async (req, res) => {
  try {
    const { to, me } = req.query;
    const client = await getClient();
    if (me) {
      const orQuery: OrQuery = {
        $or: [{ to: me as string }, { from: me as string }],
      };

      const results = await client
        .db()
        .collection<Shoutout>("shoutouts")
        .find(orQuery)
        .toArray();
      res.json(results);
    } else {
      const query: Query = {
        ...(to ? { to: to as string } : {}),
      };

      const results = await client
        .db()
        .collection<Shoutout>("shoutouts")
        .find(query)
        .toArray();
      res.status(200);
      res.json(results);
    }
    // const params: QueryStringParamns = {
    //   ...(to ? { to: to as string } : {}),
    //   ...(from ? { from: from as string } : {}),
    // };

    // const results = await client
    //   .db()
    //   .collection<Shoutout>("shoutouts")
    //   .find(params)
    //   .toArray();
    // res.json(results);
  } catch (err) {
    errorResponse(err, res);
  }
});

// shoutoutRouter.get("/:name", async (req, res) => {
//     try {
//         const client = await getClient();
//         const results = await client.db().collection<Shoutout>("shoutouts").find().sort()
//     } catch (err) {
//         errorResponse(err, res)
//     }
// })

shoutoutRouter.post("/", async (req, res) => {
  try {
    const newShoutout: Shoutout = req.body;
    const client = await getClient();
    await client.db().collection<Shoutout>("shoutouts").insertOne(newShoutout);

    res.status(200).json(newShoutout);
  } catch (err) {
    errorResponse(err, res);
  }
});

shoutoutRouter.delete("/:id", async (req, res) => {
  try {
    const id: string = req.params.id;
    const client = await getClient();
    const result = await client
      .db()
      .collection<Shoutout>("shoutouts")
      .deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount) {
      res.sendStatus(204);
    } else {
      res.status(404).send(`shoutout of ID: ${id} not found.`);
    }
  } catch (err) {
    errorResponse(err, res);
  }
});

shoutoutRouter.delete("/", async (req, res) => {
  try {
    const client = await getClient();
    await client.db().collection<Shoutout>("shoutouts").deleteMany({});

    res.sendStatus(204);
  } catch (err) {
    errorResponse(err, res);
  }
});

export default shoutoutRouter;
