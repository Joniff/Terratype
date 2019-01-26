using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Newtonsoft.Json;

namespace Terratype.Plugins
{
	public abstract class Resolver
	{
		[JsonProperty(PropertyName = "id")]
		public abstract string Id { get; }
		
		private static IDictionary<Guid, IDictionary<string, Type>> installed = new Dictionary<Guid, IDictionary<string, Type>>();

		public static void RegisterType<I, T>(string id)
			where I : class
			where T : I
		{
			lock(installed)
			{
				IDictionary<string, Type> list;
				if (!installed.TryGetValue(typeof(I).GUID, out list))
				{
					list = new Dictionary<string, Type>();
					installed.Add(typeof(I).GUID, list);
				}
				list.Add(id, typeof(T));
			}
		}

		public static IEnumerable<string> InstalledTypes<I>()
			where I : class
		{
			IDictionary<string, Type> list;
			if (installed.TryGetValue(typeof(I).GUID, out list))
			{
				return list.Keys;
			}
			return Enumerable.Empty<string>();
		}

		protected static Type ResolveType<I>(string id, string interfaceName = null)
			where I : class
		{
			IDictionary<string, Type> list;
			if (installed.TryGetValue(typeof(I).GUID, out list))
			{
				Type found = null;

				if (list.TryGetValue(id, out found))
				{
					return found;
				}
			}

			if (interfaceName == null)
			{
				interfaceName = typeof(I).Name;
			}

			var error = new StringBuilder();
			error.Append(id);
			error.Append(" is not a currently loaded Terratype ");
			error.Append(interfaceName);
			error.Append(". ");
			if (installed.Count == 0)
			{
				error.Append("Currently there are no ");
				error.Append(interfaceName);
				error.Append(" available.");
			}
			else
			{
				error.Append("The loaded ");
				error.Append(interfaceName);
				error.Append(" are ");
				var count = 0;
				foreach (var loaded in installed)
				{
					if (count++ != 0)
					{
						error.Append(", ");
					}
					error.Append(loaded.Key);
				}
				error.Append(".");
			}
			throw new NotSupportedException(error.ToString());
		}

		protected static Resolver Resolve<I>(string id, string interfaceName)
			where I : class
		{
			return Activator.CreateInstance(ResolveType<I>(id, interfaceName)) as Resolver;
		}
	}
}
