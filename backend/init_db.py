#!/usr/bin/env python3
"""
Script d'initialisation de la base de données
Crée toutes les tables et applique les migrations
"""

import sys
import os
import time
from sqlalchemy import create_engine, inspect
from database import Base, settings
import models

def wait_for_db(max_retries=30, delay=1):
    """Attendre que la base de données soit prête"""
    engine = create_engine(settings.database_url)
    for i in range(max_retries):
        try:
            connection = engine.connect()
            connection.close()
            print("✅ Connexion à PostgreSQL établie")
            return True
        except Exception as e:
            print(f"⏳ Attente de PostgreSQL... ({i+1}/{max_retries})")
            time.sleep(delay)
    return False

def create_tables():
    """Créer toutes les tables"""
    try:
        engine = create_engine(settings.database_url)
        
        # Vérifier quelles tables existent déjà
        inspector = inspect(engine)
        existing_tables = inspector.get_table_names()
        
        print("\n📊 Tables existantes :", existing_tables if existing_tables else "aucune")
        
        # Créer les tables
        print("\n📝 Création des tables...")
        Base.metadata.create_all(bind=engine)
        
        # Vérifier les tables créées
        inspector = inspect(engine)
        new_tables = inspector.get_table_names()
        
        print("\n✅ Tables créées avec succès :")
        for table in new_tables:
            cols = [col['name'] for col in inspector.get_columns(table)]
            print(f"   - {table}: {', '.join(cols[:3])}...")
        
        return True
    except Exception as e:
        print(f"\n❌ Erreur lors de la création des tables : {e}")
        return False

if __name__ == "__main__":
    print("🚀 Initialisation de la base de données...")
    print(f"📍 Base de données : {settings.database_url}")
    
    # Attendre que la BD soit prête
    if not wait_for_db():
        print("❌ Impossible de se connecter à PostgreSQL après plusieurs tentatives")
        sys.exit(1)
    
    # Créer les tables
    if create_tables():
        print("\n✅ Base de données initialisée avec succès !")
        sys.exit(0)
    else:
        print("\n❌ Erreur lors de l'initialisation")
        sys.exit(1)
