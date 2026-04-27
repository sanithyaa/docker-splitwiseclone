from flask import Flask, request, jsonify
from flask_cors import CORS
import uuid

app = Flask(__name__)
CORS(app)


# ============================
# IN-MEMORY STORAGE
# ============================

groups = []
expenses = []


# ============================
# HOME
# ============================

@app.route("/", methods=["GET"])
def home():

    return jsonify({
        "message": "Splitwise Backend Running"
    })


# ============================
# CREATE GROUP
# ============================

@app.route("/groups", methods=["POST"])
def create_group():

    data = request.json

    if not data or "name" not in data or "members" not in data:

        return jsonify({"error": "Invalid data"}), 400


    group = {

        "id": str(uuid.uuid4()),

        "name": data["name"],

        "members": data["members"]

    }

    groups.append(group)

    return jsonify(group)


# ============================
# GET GROUPS
# ============================

@app.route("/groups", methods=["GET"])
def get_groups():

    return jsonify(groups)


# ============================
# ADD EXPENSE (WITH CATEGORY)
# ============================

@app.route("/expenses", methods=["POST"])
def add_expense():

    data = request.json

    required = ["group_id", "description", "amount", "paid_by", "split_between"]

    for field in required:

        if field not in data:

            return jsonify({"error": f"{field} missing"}), 400


    expense = {

        "id": str(uuid.uuid4()),

        "group_id": data["group_id"],

        "description": data["description"],

        "amount": float(data["amount"]),

        "paid_by": data["paid_by"],

        "split_between": data["split_between"],

        "category": data.get("category", "General")

    }

    expenses.append(expense)

    return jsonify(expense)


# ============================
# GET EXPENSES FOR GROUP
# ============================

@app.route("/expenses/<group_id>", methods=["GET"])
def get_expenses(group_id):

    group_expenses = [

        e for e in expenses

        if e["group_id"] == group_id

    ]

    return jsonify(group_expenses)


# ============================
# DELETE EXPENSE
# ============================

@app.route("/expenses/<expense_id>", methods=["DELETE"])
def delete_expense(expense_id):

    global expenses

    expenses = [

        e for e in expenses

        if e["id"] != expense_id

    ]

    return jsonify({"message": "Expense deleted"})


# ============================
# CALCULATE BALANCES
# ============================

@app.route("/balances/<group_id>", methods=["GET"])
def calculate_balances(group_id):

    group_expenses = [

        e for e in expenses

        if e["group_id"] == group_id

    ]

    balances = {}

    for expense in group_expenses:

        amount = expense["amount"]

        paid_by = expense["paid_by"]

        members = expense["split_between"]

        split_amount = amount / len(members)

        for member in members:

            balances.setdefault(member, 0)

            if member == paid_by:

                balances[member] += amount - split_amount

            else:

                balances[member] -= split_amount


    return jsonify(balances)


# ============================
# SETTLE UP GROUP
# ============================

@app.route("/settle/<group_id>", methods=["POST"])
def settle_group(group_id):

    global expenses

    expenses = [

        e for e in expenses

        if e["group_id"] != group_id

    ]

    return jsonify({
        "message": "Group settled successfully"
    })


# ============================
# CATEGORY SUMMARY (FOR CHART)
# ============================

@app.route("/summary/<group_id>", methods=["GET"])
def category_summary(group_id):

    group_expenses = [

        e for e in expenses

        if e["group_id"] == group_id

    ]

    summary = {}

    for expense in group_expenses:

        category = expense["category"]

        summary[category] = summary.get(category, 0) + expense["amount"]

    return jsonify(summary)


# ============================
# RUN SERVER
# ============================

if __name__ == "__main__":

    app.run(

        host="0.0.0.0",

        port=5000,

        debug=True

    )
