using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Reflection;

namespace Terratype.Models
{
    [DebuggerDisplay("{Id}")]
    [JsonObject(MemberSerialization.OptIn, ItemTypeNameHandling = TypeNameHandling.All)]
    public abstract class Label
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
        /// Does this map have a label that the editor can edit
        /// </summary>
        [JsonProperty(PropertyName = "enable")]
        public bool Enable { get; }

        private static readonly Lazy<Dictionary<string, Type>> register =
            new Lazy<Dictionary<string, Type>>(() =>
            {
                Dictionary<string, Type> installed = new Dictionary<string, Type>();

                Type baseType = typeof(Label);
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

                        var derivedObject = System.Activator.CreateInstance(type) as Position;
                        if (derivedObject != null)
                        {
                            installed.Add(derivedObject.Id, derivedObject.GetType());
                        }
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
        public static Label Create(string id)
        {
            Type derivedType = null;
            if (Register.TryGetValue(id, out derivedType))
            {
                return System.Activator.CreateInstance(derivedType) as Label;
            }
            return null;
        }

        /// <summary>
        /// Create a derived Label from a particular type
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        public static Label Create(Type type)
        {
            return System.Activator.CreateInstance(type) as Label;
        }


    }
}

