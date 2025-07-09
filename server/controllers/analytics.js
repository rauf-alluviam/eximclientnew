import JobModel from "../models/jobModel.js";

/**
 * Calculates average per kg cost metrics grouped by HS code and supplier
 */
export async function getPerKgCostAnalytics(req, res) {
  try {
    const result = await JobModel.aggregate([
      {
        $match: {
          'net_weight_calculator.per_kg_cost': { $exists: true, $ne: "", $ne: null }
        }
      },
      {
        $addFields: {
          perKgCostNum: { $toDouble: "$net_weight_calculator.per_kg_cost" }
        }
      },
      {
        $match: {
          perKgCostNum: { $gt: 0 }
        }
      },
      {
        $group: {
          _id: {
            hsCode: "$cth_no",
            supplier: "$supplier_exporter"
          },
          avgPerKgCost: { $avg: "$perKgCostNum" },
          shipmentCount: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          hs_code: "$_id.hsCode",
          supplier: "$_id.supplier",
          avg_per_kg_cost: { $round: ["$avgPerKgCost", 2] },
          shipment_count: "$shipmentCount"
        }
      },
      {
        $sort: { avg_per_kg_cost: -1 }
      }
    ]);

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error("Error generating per kg cost analytics:", error);
    res.status(500).json({
      success: false,
      error: "Error generating analytics"
    });
  }
}

/**
 * Gets the best (lowest cost) supplier for each HS code
 */
export async function getBestSuppliersByHsCode(req, res) {
  try {
    const { hsCode, supplier } = req.query;
    
    // Build initial match conditions
    const matchConditions = {
      'net_weight_calculator.per_kg_cost': { $exists: true, $ne: "", $ne: null }
    };

    // Add HS code search if provided
    if (hsCode) {
      matchConditions.cth_no = { $regex: hsCode, $options: 'i' };
    }

    // Add supplier search if provided
    if (supplier) {
      matchConditions.supplier_exporter = { $regex: supplier, $options: 'i' };
    }

    const result = await JobModel.aggregate([
      {
        $match: matchConditions
      },
      {
        $addFields: {
          perKgCostNum: { $toDouble: "$net_weight_calculator.per_kg_cost" }
        }
      },
      {
        $match: {
          perKgCostNum: { $gt: 0 }
        }
      },
      {
        $group: {
          _id: {
            hsCode: "$cth_no",
            supplier: "$supplier_exporter"
          },
          avgPerKgCost: { $avg: "$perKgCostNum" },
          shipmentCount: { $sum: 1 }
        }
      },
      {
        $sort: { "_id.hsCode": 1, avgPerKgCost: 1 }
      },
      {
        $group: {
          _id: "$_id.hsCode",
          best_supplier: { $first: "$_id.supplier" },
          min_avg_per_kg_cost: { $first: "$avgPerKgCost" },
          shipment_count: { $first: "$shipmentCount" }
        }
      },
      {
        $project: {
          _id: 0,
          hs_code: "$_id",
          best_supplier: "$best_supplier",
          min_avg_per_kg_cost: { $round: ["$min_avg_per_kg_cost", 2] },
          shipment_count: "$shipment_count"
        }
      },
      {
        $sort: { hs_code: 1 }
      }
    ]);

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error("Error generating best suppliers analytics:", error);
    res.status(500).json({
      success: false,
      error: "Error generating analytics"
    });
  }
}
