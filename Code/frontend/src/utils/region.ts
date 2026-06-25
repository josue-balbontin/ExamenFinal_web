import type { AppState } from '../types/index.ts';
import type { Store } from './store.ts';

export async function detectRegion(store: Store<AppState>): Promise<void> {
  const StorageRegion = localStorage.getItem('region');

  if (StorageRegion) {
    store.setState({ region: StorageRegion });
  }

  try {
    const response = await fetch('https://ipapi.co/json/');


    const data = await response.json();

    if (data.status != "success") {
      localStorage.setItem('region', ' ');
      store.setState({ region: ' ' });

    }

    if (data.country_code) {
      const regionCode = data.country_code;
      localStorage.setItem('region', regionCode);
      store.setState({ region: regionCode });
    }
  }
  catch (err) {
    console.error('Error al obtener la region automaticamente', err);
    store.setState({ region: '' });
  }


}
