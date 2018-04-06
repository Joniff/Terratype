using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Globalization;
using System.IO;
using System.Reflection;
using Umbraco.Core.Logging;

namespace Terratype.Frisk
{
    public interface IFrisk
    {
        string Id { get; }
    }


    [JsonObject(MemberSerialization.OptIn)]
    public static class Frisk
    {

        private static readonly Type[] interests = new Type[]
        {
            typeof(Models.Position),
            typeof(Models.Provider),
            typeof(Models.Label)
        };

        private static void registerAssembly(Assembly currAssembly, ref Dictionary<string, Dictionary<string, Type>> installed)
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
                if (type == null || !type.IsClass || type.IsAbstract)
                {
                    continue;
                }

                foreach (var interest in interests)
                {
                    if (type.IsSubclassOf(interest))
                    {
                        var derivedObject = System.Activator.CreateInstance(type) as IFrisk;
                        if (derivedObject != null)
                        {
                            installed[interest.FullName].Add(derivedObject.Id, derivedObject.GetType());
                        }
                    }
                }

            }
        }

        private static readonly Lazy<Dictionary<string, Dictionary<string, Type>>> register =
            new Lazy<Dictionary<string, Dictionary<string, Type>>>(() =>
            {
                var installed = new Dictionary<string, Dictionary<string, Type>>();
                foreach (var interest in interests)
                {
                    installed.Add(interest.FullName, new Dictionary<string, Type>());
                }
                var filenames = new HashSet<string>();

                //  First read those in current domain
                foreach (Assembly currAssembly in AppDomain.CurrentDomain.GetAssemblies())
                {
                    try
                    {
                        if (!currAssembly.IsDynamic)
                        {
                            filenames.Add(currAssembly.Location.ToLowerInvariant());
                        }
                        registerAssembly(currAssembly, ref installed);
                    }
                    catch(Exception ex)
                    {
                        LogHelper.Error(typeof(Frisk), $"TerraType: Error registering assemblies in AppDomain, asesembly {currAssembly.FullName}", ex);
                    }
                }

                //  Now see if any dlls haven't been loaded yet
                var path = Path.GetDirectoryName(Assembly.GetExecutingAssembly().Location);

                var di = new DirectoryInfo(path);
                foreach (var file in di.GetFiles("*.dll"))
                {
                    if (filenames.Contains(file.FullName.ToLowerInvariant()))
                    {
                        continue;
                    }

                    try
                    {
                        var currAssembly = Assembly.ReflectionOnlyLoadFrom(file.FullName);
                        if (!currAssembly.IsDynamic)
                        {
                            filenames.Add(currAssembly.Location.ToLowerInvariant());
                        }
                        registerAssembly(currAssembly, ref installed);
                    }
                    catch (BadImageFormatException)
                    {
                        // Not a .net assembly  - ignore
                    }
                }
                return installed;
            });

        public static IDictionary<string, Type> Register<T>()
        {
            Dictionary<string, Type> results;
            if (register.Value.TryGetValue(typeof(T).FullName, out results))
            {
                return results;
            }
            return new Dictionary<string, Type>();  //  Return empty dictionary
        }

    }
}
