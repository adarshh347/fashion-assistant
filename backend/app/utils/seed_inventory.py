import os
from langchain_chroma import Chroma
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_core.documents import Document

print("--- Loading Embedding Model (This might take a minute)... ---")

embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")


products = [
    {"id": "1", "name": "Classic Denim Jacket", "category": "jacket", "desc": "A timeless denim jacket in medium wash. Perfect for casual spring days.", "price": 45.00},
    {"id": "2", "name": "Boho Floral Maxi Dress", "category": "dress", "desc": "Flowing red maxi dress with floral patterns. Great for summer parties.", "price": 65.00},
    {"id": "3", "name": "Slim Fit Chinos", "category": "pants", "desc": "Beige slim fit chinos. versatile and comfortable for office wear.", "price": 40.00},
    {"id": "4", "name": "Leather Biker Jacket", "category": "jacket", "desc": "Black faux leather biker jacket with silver zippers. Edgy style.", "price": 85.00},
    {"id": "5", "name": "Oversized Knit Sweater", "category": "sweater", "desc": "Cozy cream-colored chunky knit sweater. Warm and stylish for winter.", "price": 55.00},
    {"id": "6", "name": "Running Sneakers", "category": "shoes", "desc": "Lightweight blue running shoes with high arch support.", "price": 70.00},
]

docs = []
for product in products:
    content = f"{product['name']}: {product['desc']} Category: {product['category']} Price: ${product['price']}"
    doc = Document(
        page_content=content,
        metadata={"product_id": product["id"], "price": product["price"], "name": product["name"]}
    )
    docs.append(doc)

# saving this to chromadb(locally for now)
print(f"--- Seeding {len(docs)} products into Vector DB... ---")

db = Chroma.from_documents(
    documents=docs,
    embedding=embeddings,
    persist_directory="./chroma_db_data"
)
print("--- ✅ Inventory Seeded Successfully! ---")