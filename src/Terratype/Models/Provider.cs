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
    public abstract class Provider
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

        //  Register all derived classes
        private static readonly Lazy<Dictionary<string, Type>> providers =
            new Lazy<Dictionary<string, Type>>(() =>
            {
                Dictionary<string, Type> installed = new Dictionary<string, Type>();
                Type baseType = typeof(Provider);
                foreach (Assembly currAssembly in AppDomain.CurrentDomain.GetAssemblies())
                {
                    Type[] typesInAsm;
                    try
                    {
                        typesInAsm = currAssembly.GetTypes();
                    }
                    catch (ReflectionTypeLoadException ex)
                    {
                        typesInAsm = ex.Types;
                    }

                    foreach (Type type in typesInAsm)
                    {
                        if (!type.IsClass || type.IsAbstract ||
                            !type.IsSubclassOf(baseType))
                        {
                            continue;
                        }

                        var derivedObject = System.Activator.CreateInstance(type) as Provider;
                        if (derivedObject != null)
                        {
                            installed.Add(derivedObject.Id, derivedObject.GetType());
                        }
                    }
                }
                return installed;
            });

        public static Dictionary<string, Type> Providers
        {
            get
            {
                return providers.Value;
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
            if (Providers.TryGetValue(id, out derivedType))
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

        public abstract void GetHtml(HtmlTextWriter writer, int id, Models.Model model, int height, string language, string labelId);
    }
}
