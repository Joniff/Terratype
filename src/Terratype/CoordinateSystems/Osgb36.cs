using Newtonsoft.Json;
using System;
using System.Globalization;

namespace Terratype.CoordinateSystems
{
    //  https://en.wikipedia.org/wiki/Ordnance_Survey_National_Grid

    [JsonObject(MemberSerialization.OptIn)]
    public class Osgb36 : Position
    {
        internal class Grid
        {
            public int Easting;
            public int Northing;
        }

        [JsonProperty]
        public override string Id
        {
            get
            {
                return "OSGB36";
            }
        }

        public override string Name
        {
            get
            {
                return "OSGB36";
            }
        }

        public override string Description
        {
            get
            {
                return "UK only Ordnance Survey grid system. Display format is a grid reference AA 000 000";
            }
        }

        public override string ReferenceUrl
        {
            get
            {
                return "https://en.wikipedia.org/wiki/Ordnance_Survey_National_Grid";
            }
        }

        public override int Precision
        {
            get
            {
                return 3;
            }
        }

        public override string ToString()
        {
            Grid grid = Datum as Grid;

            double e = grid.Easting;
            double n = grid.Northing;

            // get the 100km-grid indices
            double e100k = Math.Floor(e / 100000.0), n100k = Math.Floor(n / 100000.0);

            if (e100k < 0 || e100k > 6 || n100k < 0 || n100k > 12)
            {
                return null;
            }
            // translate those into numeric equivalents of the grid letters
            char l1 = (char) ((19 - n100k) - (19 - n100k) % 5.0 + Math.Floor((e100k + 10.0) / 5.0));
            char l2 = (char) ((19 - n100k) * 5.0 % 25.0 + e100k % 5.0);

            // compensate for skipped 'I' and build grid letter-pairs
            if (l1 > 7.0)
            {
                l1++;
            }
            if (l2 > 7)
            {
                l2++;
            }
            // strip 100km-grid indices from easting & northing, and reduce precision
            e = Math.Floor((e % 100000.0) / Math.Pow(10, 5 - Precision / 2));
            n = Math.Floor((n % 100000.0) / Math.Pow(10, 5 - Precision / 2));

            return $"{l1 + 'A'}{l2 + 'A'} {e} {n}";
        }

        /// <summary>
        /// To convert back from display format. Convert Position to Wgs84 if you want a guarenteed numeric format
        /// </summary>
        public new bool TryParse(string latlng)
        {
            throw new NotImplementedException();
        }

        public override LatLng ToWgs84()
        {
            Grid grid = Datum as Grid;

            double E = grid.Easting, N = grid.Northing;

            double a = 6377563.396, b = 6356256.909;              // Airy 1830 major & minor semi-axes
            double F0 = 0.9996012717;                             // NatGrid scale factor on central meridian
            double φ0 = 49.0 * Math.PI / 180.0, λ0 = -2.0 * Math.PI / 180.0;  // NatGrid true origin is 49°N,2°W
            double N0 = -100000.0, E0 = 400000.0;                     // northing & easting of true origin, metres
            double e2 = 1.0 - (b * b) / (a * a);                          // eccentricity squared
            double n = (a - b) / (a + b), n2 = n * n, n3 = n2 * n;         // n, n², n³

            double φ = φ0, M = 0.0;
            do
            {
                φ = (N - N0 - M) / (a * F0) + φ;

                double Ma = (1.0 + n + (5.0 / 4.0) * n2 + (5.0 / 4.0) * n3) * (φ - φ0);
                double Mb = (3.0 * n + 3 * n * n + (21.0 / 8.0) * n3) * Math.Sin(φ - φ0) * Math.Cos(φ + φ0);
                double Mc = ((15.0 / 8.0) * n2 + (15.0 / 8.0) * n3) * Math.Sin(2 * (φ - φ0)) * Math.Cos(2.0 * (φ + φ0));
                double Md = (35.0 / 24.0) * n3 * Math.Sin(3.0 * (φ - φ0)) * Math.Cos(3.0 * (φ + φ0));
                M = b * F0 * (Ma - Mb + Mc - Md);              // meridional arc

            }
            while (N - N0 - M >= 0.00001);  // ie until < 0.01mm

            double cosφ = Math.Cos(φ), sinφ = Math.Sin(φ);
            double ν = a * F0 / Math.Sqrt(1 - e2 * sinφ * sinφ);            // nu = transverse radius of curvature
            double ρ = a * F0 * (1.0 - e2) / Math.Pow(1.0 - e2 * sinφ * sinφ, 1.5); // rho = meridional radius of curvature
            double η2 = ν / ρ - 1.0;                                    // eta = ?

            double tanφ = Math.Tan(φ);
            double tan2φ = tanφ * tanφ, tan4φ = tan2φ * tan2φ, tan6φ = tan4φ * tan2φ;
            double secφ = 1 / cosφ;
            double ν3 = ν * ν * ν, ν5 = ν3 * ν * ν, ν7 = ν5 * ν * ν;
            double VII = tanφ / (2.0 * ρ * ν);
            double VIII = tanφ / (24.0 * ρ * ν3) * (5.0 + 3.0 * tan2φ + η2 - 9.0 * tan2φ * η2);
            double IX = tanφ / (720.0 * ρ * ν5) * (61.0 + 90.0 * tan2φ + 45.0 * tan4φ);
            double X = secφ / ν;
            double XI = secφ / (6.0 * ν3) * (ν / ρ + 2.0 * tan2φ);
            double XII = secφ / (120.0 * ν5) * (5.0 + 28.0 * tan2φ + 24.0 * tan4φ);
            double XIIA = secφ / (5040.0 * ν7) * (61.0 + 662.0 * tan2φ + 1320.0 * tan4φ + 720.0 * tan6φ);

            double dE = (E - E0), dE2 = dE * dE, dE3 = dE2 * dE, dE4 = dE2 * dE2, dE5 = dE3 * dE2, dE6 = dE4 * dE2, dE7 = dE5 * dE2;
            φ = φ - VII * dE2 + VIII * dE4 - IX * dE6;
            var λ = λ0 + X * dE - XI * dE3 + XII * dE5 - XIIA * dE7;

            return new LatLng
            {
                Latitude = φ * 180 / Math.PI,
                Longitude = λ * 180 / Math.PI
            };
        }

        public override void FromWgs84(LatLng wgs84Position)
        {
            var latitude = wgs84Position.Latitude * Math.PI / 180.0;
            var longitude = wgs84Position.Longitude * Math.PI / 180.0;

            double a = 6377563.396, b = 6356256.910; // Airy 1830 major & minor semi-axes
            double F0 = 0.9996012717; // NatGrid scale factor on central meridian
            double lat0 = 49.0 * Math.PI / 180.0;
            double lon0 = -2.0 * Math.PI / 180.0; // NatGrid true origin
            double N0 = -100000.0, E0 = 400000.0; // northing & easting of true origin, metres
            double e2 = 1 - (b * b) / (a * a); // eccentricity squared
            double n = (a - b) / (a + b), n2 = n * n, n3 = n * n * n;

            double cosLat = Math.Cos(latitude), sinLat = Math.Sin(latitude);
            double nu = a * F0 / Math.Sqrt(1.0 - e2 * sinLat * sinLat); // transverse radius of curvature
            double rho = a * F0 * (1.0 - e2) / Math.Pow(1.0 - e2 * sinLat * sinLat, 1.5); // meridional radius of curvature

            double eta2 = nu / rho - 1.0;

            double Ma = (1.0 + n + (5.0 / 4.0) * n2 + (5.0 / 4.0) * n3) * (latitude - lat0);
            double Mb = (3.0 * n + 3.0 * n * n + (21.0 / 8.0) * n3) * Math.Sin(latitude - lat0) * Math.Cos(latitude + lat0);
            double Mc = ((15.0 / 8.0) * n2 + (15.0 / 8.0) * n3) * Math.Sin(2.0 * (latitude - lat0)) * Math.Cos(2.0 * (latitude + lat0));
            double Md = (35.0 / 24.0) * n3 * Math.Sin(3.0 * (latitude - lat0)) * Math.Cos(3.0 * (latitude + lat0));
            double M = b * F0 * (Ma - Mb + Mc - Md); // meridional arc

            double cos3lat = cosLat * cosLat * cosLat;
            double cos5lat = cos3lat * cosLat * cosLat;
            double tan2lat = Math.Tan(latitude) * Math.Tan(latitude);
            double tan4lat = tan2lat * tan2lat;

            double I = M + N0;
            double II = (nu / 2.0) * sinLat * cosLat;
            double III = (nu / 24.0) * sinLat * cos3lat * (5.0 - tan2lat + 9.0 * eta2);
            double IIIA = (nu / 720.0) * sinLat * cos5lat * (61.0 - 58.0 * tan2lat + tan4lat);
            double IV = nu * cosLat;
            double V = (nu / 6.0) * cos3lat * (nu / rho - tan2lat);
            double VI = (nu / 120.0) * cos5lat * (5.0 - 18.0 * tan2lat + tan4lat + 14.0 * eta2 - 58.0 * tan2lat * eta2);

            double dLon = longitude - lon0;
            double dLon2 = dLon * dLon, dLon3 = dLon2 * dLon, dLon4 = dLon3 * dLon, dLon5 = dLon4 * dLon, dLon6 = dLon5 * dLon;

            double N = Math.Round(I + II * dLon2 + III * dLon4 + IIIA * dLon6, 0);
            double E = Math.Round(E0 + IV * dLon + V * dLon3 + VI * dLon5, 0);

            Datum = new Grid
            {
                Northing = (int) N,
                Easting = (int) E
            };
        }
    }
}
