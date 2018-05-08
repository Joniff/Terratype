using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Reflection;


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
            typeof(Models.Label),
			typeof(Indexer.Index),
			typeof(Indexer.Searchers.ISearch<Indexer.Searchers.ISearchRequest>)
        };

		private static bool IsInterfaceOf(Type got, Type lookingFor)
		{
			var inters = got.GetInterfaces();
			if (inters.Length > 0)
			{
				foreach (var inter in inters)
				{
					if ((inter.Name == lookingFor.Name && inter.Namespace == lookingFor.Namespace) || IsInterfaceOf(inter, lookingFor))
					{
						return true;
					}
				}
			}
			return false;
		}

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
					if (type.IsSubclassOf(interest) || (interest.GenericTypeArguments.Length > 0 && IsInterfaceOf(type, interest)))
					{
						var derivedObject = Activator.CreateInstance(type) as IFrisk;
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
                    if (!currAssembly.IsDynamic)
                    {
                        filenames.Add(currAssembly.Location.ToLowerInvariant());
	                    registerAssembly(currAssembly, ref installed);
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
                        if (currAssembly.IsDynamic)
                        {
							continue;
                        }
						filenames.Add(currAssembly.Location.ToLowerInvariant());
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

		private static IEnumerable<string> testFile(Type lookFor, Assembly currAssembly)
		{
			var results = new List<string>();

            Type[] typesInAsm;
            try
            {
                typesInAsm = currAssembly.GetTypes();
            }
            catch (ReflectionTypeLoadException ex)
            {
                typesInAsm = ex.Types;
            }

			int count = 0;

            foreach (Type type in typesInAsm)
            {
                if (type == null || !type.IsClass || type.IsAbstract)
                {
                    continue;
                }

				if (type.IsSubclassOf(lookFor) || (lookFor.GenericTypeArguments.Length > 0 && IsInterfaceOf(type, lookFor)))
				{
					count++;
					var derivedObject = Activator.CreateInstance(type) as IFrisk;
					if (derivedObject != null)
					{
						results.Add($"Correctly found and can instantiate {type.Name} in {currAssembly.Location}");
						continue;
					}
					results.Add($"Found but can\'t instantiate {type.Name} in {currAssembly.Location}");
					continue;
				}
			}

			if (count == 0)
			{
				results.Add($"Not found {lookFor.Name} in {currAssembly.Location}");
			}
			return results;
		}

		public static IEnumerable<string> Test(Type lookFor, IEnumerable<string> files)
		{
			//	First see if we would find these files normally
			var results = new List<string>();

            foreach (Assembly currAssembly in AppDomain.CurrentDomain.GetAssemblies())
            {
                if (currAssembly.IsDynamic)
                {
					continue;
				}
				var filename = Path.GetFileName(currAssembly.Location).ToLowerInvariant();
				if (files.Any(x => x == filename))
				{
					results.Add($"Found {currAssembly.Location} Assembly in Current App Domain");
					results.AddRange(testFile(lookFor, currAssembly));
				}
			}

            var path = Path.GetDirectoryName(Assembly.GetExecutingAssembly().Location);

            var di = new DirectoryInfo(path);
            foreach (var file in di.GetFiles("*.dll"))
            {
                try
                {
                    var currAssembly = Assembly.ReflectionOnlyLoadFrom(file.FullName);
                    if (currAssembly.IsDynamic)
                    {
                        continue;
                    }
					var filename = Path.GetFileName(currAssembly.Location).ToLowerInvariant();
					if (files.Any(x => x == filename))
					{
						results.Add($"Found {currAssembly.Location} Assembly in {di.FullName} folder");
						results.AddRange(testFile(lookFor, currAssembly));
					}
                }
                catch (BadImageFormatException)
                {
                    // Not a .net assembly  - ignore
                }
            }

            return results;
		}
    }
}
