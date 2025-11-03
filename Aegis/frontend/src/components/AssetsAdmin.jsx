eventHandlers={{
  popupopen: () => {
    console.log('popup opened for base', base.id);
    loadBaseWeather(base);
  }
}}