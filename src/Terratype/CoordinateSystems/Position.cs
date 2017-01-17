using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Globalization;
using System.Reflection;

namespace Terratype.CoordinateSystems
{
    [DebuggerDisplay("{Name}:{Datum}")]
    [JsonObject(MemberSerialization.OptIn)]
    public abstract class Position
    {
        /// <summary>
        /// Unique identifier of coordinate system
        /// </summary>
        [JsonProperty]
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

        [JsonProperty]
        internal object Datum { get; set; }

        /// <summary>
        /// To display position to user
        /// </summary>
        /// <returns></returns>
        public override string ToString()
        {
            if (Datum is LatLng)
            {
                LatLng datum = Datum as LatLng;
                return Math.Round(datum.Latitude, 6).ToString(CultureInfo.InvariantCulture) + "," +
                    Math.Round(datum.Longitude, 6).ToString(CultureInfo.InvariantCulture);
            }
            throw new NotImplementedException();
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
            Datum = new LatLng
            {
                Latitude = lat,
                Longitude = lng
            };
            return true;
        }

        public abstract LatLng ToWgs84();

        public abstract void FromWgs84(LatLng wgs84Position);

        //  Register all derived classes
        private static readonly Lazy<Dictionary<string, Type>> register =
            new Lazy<Dictionary<string, Type>>(() =>
            {
                Dictionary<string, Type> installed = new Dictionary<string, Type>();
                Assembly currAssembly = Assembly.GetExecutingAssembly();

                Type baseType = typeof(Position);

                foreach (Type type in currAssembly.GetTypes())
                {
                    if (!type.IsClass || type.IsAbstract ||
                        !type.IsSubclassOf(baseType))
                    {
                        continue;
                    }

                    var derivedObject = System.Activator.CreateInstance(type) as Position;
                    if (derivedObject != null)
                    {
                        installed.Add(derivedObject.Id, derivedObject.GetType());
                    }
                }

                return installed;
            });

        public static IDictionary<string, Type> Register
        {
            get
            {
                return register.Value;
            }
        }

        /// <summary>
        /// Create a derived Position with a particular Id
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        public static Position Create(string id)
        {
            Type derivedType = null;
            if (Register.TryGetValue(id, out derivedType))
            {
                return System.Activator.CreateInstance(derivedType) as Position;
            }
            return null;
        }
    }
}
