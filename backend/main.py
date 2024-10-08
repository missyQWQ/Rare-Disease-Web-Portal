import uvicorn
from fastapi import FastAPI, Query
from database import (
    fetch_severity_data,
    fetch_cell_data,
    fetch_cell_type,
    fetch_severity_dataByHpoIdNew,
    fetch_gene,
    fetch_gene1,
    fetch_hpoADJ_full,
)
from fastapi.middleware.cors import CORSMiddleware

# Create an instance of the FastAPI application
app = FastAPI()

# Define the list of allowed origins for CORS
origins = [
    "http://localhost:5173",
]

# Add CORS middleware to the FastAPI application
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/hpj")
def hpj():
    """
    Fetch all documents from the hpoADJ_full collection.

    Returns:
        List of documents with '_id' field removed.
    """
    response = fetch_hpoADJ_full()
    if response:
        return response
    return []


@app.get("/api/cellByHpoid1")
def get_severity_data(
    hpo_id: str = Query(...),
    db_type: str = Query(...),
):
    """
    Fetch cell data based on HPO ID and database type.

    Args:
        hpo_id (str): The HPO ID to query.
        db_type (str): The type of database to query.

    Returns:
        List of documents matching the query conditions.
    """
    query = {
        "hpo_id": hpo_id,
    }
    response = fetch_cell_data(db_type, query)
    if response:
        return response
    return []


@app.get("/api/cellByHpoid")
def get_severity_data(
    hpo_id: str = Query(...),
):
    """
    Fetch cell data based on HPO ID from both DescartesHuman and HumanCellLandscape databases.

    Args:
        hpo_id (str): The HPO ID to query.

    Returns:
        List of documents matching the query conditions.
    """
    query = {
        "hpo_id": hpo_id,
    }
    response = fetch_cell_data("DescartesHuman", query)
    res = []
    if response:
        res.extend(response)
    response = fetch_cell_data("HumanCellLandscape", query)
    if response:
        res.extend(response)
        return res


@app.get("/api/cell/type")
def get_severity_data(
    celltype_name: str = Query(...),
    db_type: str = Query(...),
):
    """
    Fetch cell type data based on cell type name and database type.

    Args:
        celltype_name (str): The name of the cell type to query.
        db_type (str): The type of database to query.

    Returns:
        List of documents matching the query conditions.
    """
    query = {
        "celltype_name": {"$regex": celltype_name, "$options": "i"},
    }
    response = fetch_cell_type(db_type, query)
    # print(response)
    if response:
        return response
    return []


@app.get("/api/cell")
def get_severity_data(
    celltype_name: str = Query(...),
    q: float = Query(...),
    db_type: str = Query(...),
):
    """
    Fetch cell data based on various query parameters.

    Args:
        celltype_name (str): The name of the cell type to query.
        q (float): The q value to query.
        db_type (str): The type of database to query.

    Returns:
        List of documents matching the query conditions.
    """
    query = {
        "celltype_name": celltype_name,
        "q": {"$lt": q},
    }
    if celltype_name == "All":
        query.pop("celltype_name")
    response = fetch_cell_data(db_type, query)
    # print(response)
    if response:
        return response
    return []


@app.get("/api/severity")
def get_severity_data(
    intellectual_disability: str = Query(...),
    death: str = Query(...),
    impaired_mobility: str = Query(...),
    physical_malformations: str = Query(...),
    blindness: str = Query(...),
    sensory_impairments: str = Query(...),
    immunodeficiency: str = Query(...),
    cancer: str = Query(...),
    reduced_fertility: str = Query(...),
    congenital_onset: str = Query(...),
    severity_class: str = Query(...),
    pageSize: int = Query(...),
    current: int = Query(...),
    with1: bool = Query(...),
    without: bool = Query(...),
):
    """
    Fetch severity data based on various disease-related indicators.

    Args:
        intellectual_disability (str): Indicator for intellectual disability.
        death (str): Indicator for death.
        impaired_mobility (str): Indicator for impaired mobility.
        physical_malformations (str): Indicator for physical malformations.
        blindness (str): Indicator for blindness.
        sensory_impairments (str): Indicator for sensory impairments.
        immunodeficiency (str): Indicator for immunodeficiency.
        cancer (str): Indicator for cancer.
        reduced_fertility (str): Indicator for reduced fertility.
        congenital_onset (str): Indicator for congenital onset.
        severity_class (str): Indicator for severity class.
        pageSize (int): Number of documents per page.
        current (int): Current page number.
        with1 (bool): Flag to include certain data.
        without (bool): Flag to exclude certain data.

    Returns:
        List of documents matching the query conditions.
    """
    if not with1 and not without:
        return []
    response = fetch_severity_data(
        intellectual_disability,
        death,
        impaired_mobility,
        physical_malformations,
        blindness,
        sensory_impairments,
        immunodeficiency,
        cancer,
        reduced_fertility,
        congenital_onset,
        severity_class,
        pageSize,
        current,
        with1,
        without,
    )
    print(response)
    if response:
        return response
    return []


@app.get("/api/hpo-definitionNew/{hpo_id}")
def definitionNew(hpo_id: str):
    """
    Fetch severity data based on the HPO ID.

    Args:
        hpo_id (str): The HPO ID to query.

    Returns:
        List of documents matching the query conditions.
    """
    hpo_id = hpo_id.replace("%", ":")
    response = fetch_severity_dataByHpoIdNew(hpo_id)
    print(response)
    if response:
        return response
    return []


@app.get("/gene/{Gene_name}/{db_type}")
def definitionNew(Gene_name: str, db_type: str):
    """
    Fetch gene data based on the gene name and database type.

    Args:
        Gene_name (str): The name of the gene to query.
        db_type (str): The type of database to query.

    Returns:
        List of documents matching the query conditions.
    """
    Gene_name = Gene_name.replace("%", ":")
    response = fetch_gene(Gene_name, db_type)
    if response:
        return response
    return []


@app.get("/gene1/{Gene_name}/{db_type}")
def gene1(Gene_name: str, db_type: str):
    """
    Fetch gene1 data based on the gene name and database type.

    Args:
        Gene_name (str): The name of the gene to query.
        db_type (str): The type of database to query.

    Returns:
        List of documents matching the query conditions.
    """
    Gene_name = Gene_name.replace("%", ":")
    response = fetch_gene1(Gene_name, db_type)
    if response:
        return response
    return []


if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)
