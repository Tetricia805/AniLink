from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID
import math

from app.modules.vets.models import Vet
from app.modules.vets.repository import VetRepository
from app.modules.users.models import User
from app.shared.geo import haversine_distance


class VetService:
    """Service for vet business logic."""
    
    def __init__(self, db: Session):
        self.repository = VetRepository(db)
        self.db = db
    
    def search_vets(
        self,
        latitude: Optional[float] = None,
        longitude: Optional[float] = None,
        radius_km: Optional[float] = None,
        specialization: Optional[str] = None,
        farm_visits: Optional[bool] = None,
        is_24_hours: Optional[bool] = None,
    ) -> List[tuple[Vet, Optional[float]]]:
        """
        Search vets with filters and calculate distance.
        
        Returns:
            List of tuples: (vet, distance_km)
        """
        vets = self.repository.search(
            specialization=specialization,
            farm_visits=farm_visits,
            is_24_hours=is_24_hours,
        )
        
        # Calculate distance if coordinates provided
        if latitude and longitude:
            results = []
            for vet in vets:
                distance = haversine_distance(
                    latitude, longitude,
                    vet.location_lat, vet.location_lng,
                )
                
                # Filter by radius if specified
                if radius_km is None or distance <= radius_km:
                    results.append((vet, distance))
            
            # Sort by distance
            results.sort(key=lambda x: x[1] if x[1] else float('inf'))
            return results
        else:
            return [(vet, None) for vet in vets]
    
    def get_vet_by_id(self, vet_id: UUID) -> Optional[Vet]:
        """Get vet by user_id."""
        return self.repository.get_by_user_id(vet_id)
    
    def update_vet_profile(self, user_id: UUID, vet_data: dict) -> Vet:
        """Update vet profile."""
        vet = self.repository.get_by_user_id(user_id)
        if not vet:
            # Create new vet profile (clinic_name required; lat/lng nullable)
            create_data = dict(vet_data)
            if "clinic_name" not in create_data or create_data["clinic_name"] is None:
                create_data["clinic_name"] = "My Clinic"
            vet = Vet(user_id=user_id, **create_data)
            self.db.add(vet)
        else:
            # Update existing
            for key, value in vet_data.items():
                if hasattr(vet, key):
                    setattr(vet, key, value)
        
        self.db.commit()
        self.db.refresh(vet)
        
        # Also update user if name/email changed
        if "name" in vet_data or "email" in vet_data:
            user = self.db.query(User).filter(User.id == user_id).first()
            if user:
                if "name" in vet_data:
                    user.name = vet_data["name"]
                if "email" in vet_data:
                    user.email = vet_data["email"]
                self.db.commit()
        
        return vet
