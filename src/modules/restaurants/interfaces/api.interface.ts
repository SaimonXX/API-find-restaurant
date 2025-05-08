interface IGeoapifyPlaceProperties {
  name?: string
  address_line1?: string
  address_line2?: string
  lat: number
  lon: number
}

interface IGeoapifyPlaceFeature {
  properties: IGeoapifyPlaceProperties
}

interface IGeoapifyGeocodeProperties {
  lat: number
  lon: number
}

interface IGeoapifyGeocodeFeature {
  properties: IGeoapifyGeocodeProperties
}

export { IGeoapifyGeocodeFeature, IGeoapifyPlaceFeature }
