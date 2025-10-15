import sys
sys.path.insert(0, '/app/app')

from db import Base, get_session
from main import BASES

def sync_bases():
    session = get_session()
    
    for base_data in BASES:
        existing = session.query(Base).filter_by(id=base_data['id']).first()
        if not existing:
            # Remove assets_stored from the data since it's a relationship
            base_dict = {k: v for k, v in base_data.items() if k != 'assets_stored'}
            base = Base(**base_dict)
            session.add(base)
            print(f'Added: {base_data[\"name\"]}')
        else:
            print(f'Already exists: {base_data[\"name\"]}')
    
    session.commit()
    print('Done!')

if __name__ == '__main__':
    sync_bases()
