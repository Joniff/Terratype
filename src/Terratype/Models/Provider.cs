using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Reflection;
using System.Web;
using System.Web.Mvc;
using System.Web.UI;

namespace Terratype.Models
{
    [DebuggerDisplay("{Id}")]
    [JsonObject(MemberSerialization.OptIn, ItemTypeNameHandling = TypeNameHandling.All)]
    public abstract class Provider : Frisk.IFrisk
    {
        /// <summary>
        /// Unique identifier of provider
        /// </summary>
        [JsonProperty(PropertyName = "id")]
        public abstract string Id { get; }

        /// <summary>
        /// Name of provider
        /// </summary>
        public abstract string Name { get; }

        /// <summary>
        /// Description of provider
        /// </summary>
        public abstract string Description { get; }

        /// <summary>
        /// Url that a developer can use to get more information about this map provider
        /// </summary>
        public abstract string ReferenceUrl { get; }

        /// <summary>
        /// Coordinate systems that this map provider can handle
        /// </summary>
        public abstract IDictionary<string, Type> CoordinateSystems { get; }

        /// <summary>
        /// Can this map handle searches
        /// </summary>
        public virtual bool CanSearch
        {
            get
            {
                return false;
            }
        }

        public static IDictionary<string, Type> Register
        {
            get
            {
                return Frisk.Frisk.Register<Provider>();
            }
        }

        /// <summary>
        /// Create a derived Provider with a particular Id
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        public static Provider Create(string id)
        {
            Type derivedType = null;
            if (Register.TryGetValue(id, out derivedType))
            {
                return System.Activator.CreateInstance(derivedType) as Provider;
            }
            return null;
        }

        /// <summary>
        /// Create a derived Provider from a particular type
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        public static Provider Create(Type type)
        {
            return System.Activator.CreateInstance(type) as Provider;
        }

        public abstract void GetHtml(HtmlTextWriter writer, int id, Models.Model model, string labelId = null, int? height = null, string language = null, 
            Options.DomMonitorTypes domMonitorType = Options.DomMonitorTypes.Javascript);
    }
}
