using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Globalization;
using System.Reflection;

namespace Terratype.Models
{
    [DebuggerDisplay("{DebugValue} ({Id})")]
    [JsonObject(MemberSerialization.OptIn, ItemTypeNameHandling = TypeNameHandling.All)]
    public abstract class Position : Frisk.IFrisk
    {
        /// <summary>
        /// Unique identifier of coordinate system
        /// </summary>
        [JsonProperty(PropertyName = "id")]
        public abstract string Id { get; }

        /// <summary>
        /// Name of coordinate system
        /// </summary>
        public abstract string Name { get; }

        /// <summary>
        /// Description of coordinate system
        /// </summary>
        public abstract string Description { get; }

        /// <summary>
        /// Url that a developer can use to get more information about this coordinate system
        /// </summary>
        public abstract string ReferenceUrl { get; }

        [JsonProperty(PropertyName = "datum")]
        internal object _internalDatum { get; set; }

        protected object _inheritedDatum
        {
            get
            {
                return _internalDatum;
            }
            set
            {
                _internalDatum = value;
            }
        }

        public virtual int Precision
        {
            get
            {
                return 6;       //  Depending on coordinate system, this means different thing
            }
        }

        /// <summary>
        /// To display position to user
        /// </summary>
        /// <returns></returns>
        public override string ToString()
        {
            if (_internalDatum is LatLng)
            {
                LatLng latlng = _internalDatum as LatLng;
                return Math.Round(latlng.Latitude, Precision).ToString(CultureInfo.InvariantCulture) + "," +
                    Math.Round(latlng.Longitude, Precision).ToString(CultureInfo.InvariantCulture);
            }
            if (_internalDatum is string)
            {
                return _internalDatum as string;
            }
            return null;
        }

        /// <summary>
        /// Parses human readable position
        /// </summary>
        public virtual void Parse(string datum)
        {
            if (!TryParse(datum))
            {
                throw new ArgumentException();
            }
        }

        /// <summary>
        /// Parses human readable position if possible
        /// </summary>
        public virtual bool TryParse(string datum)
        {
            if (String.IsNullOrWhiteSpace(datum))
            {
                return false;
            }
            var args = datum.Split(',');
            double lat = 0.0, lng = 0.0;
            if (args.Length != 2 ||
                !double.TryParse(args[0], NumberStyles.Any, CultureInfo.InvariantCulture, out lat) ||
                !double.TryParse(args[1], NumberStyles.Any, CultureInfo.InvariantCulture, out lng))
            {
                return false;
            }
            _internalDatum = Math.Round(lat, Precision).ToString(CultureInfo.InvariantCulture) + "," +
                    Math.Round(lng, Precision).ToString(CultureInfo.InvariantCulture);
            return true;
        }

        /// <summary>
        /// Convert the current position to a Wgs84 location
        /// </summary>
        /// <returns>A Wgs84 location</returns>
        public abstract LatLng ToWgs84();

        /// <summary>
        /// Set the position to the Wgs84 location provided
        /// </summary>
        public abstract void FromWgs84(LatLng wgs84Position);

        public static IDictionary<string, Type> Register
        {
            get
            {
                return Frisk.Frisk.Register<Position>();
            }
        }

        /// <summary>
        /// Create a derived Position with a particular Id
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        public static Position Create(string id, string initialLocation = null)
        {
            Type derivedType = null;
            if (Register.TryGetValue(id, out derivedType))
            {
                var pos = System.Activator.CreateInstance(derivedType) as Position;
                if (initialLocation != null)
                {
                    pos.Parse(initialLocation);
                }
                return pos;
            }
            return null;
        }

        /// <summary>
        /// Create a derived Position from a particular type
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        public static Position Create(Type type)
        {
            return System.Activator.CreateInstance(type) as Position;
        }

        private string DebugValue
        {
            get
            {
                return ToString();
            }
        }
    }
}
