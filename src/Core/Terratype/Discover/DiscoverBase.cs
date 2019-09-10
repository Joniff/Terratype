using System.Collections.Generic;
using System.Linq;
using Umbraco.Core.Composing;

namespace Terratype.Discover
{
	public abstract class DiscoverBase : IDiscover
	{
		/// <summary>
		/// Id of provider
		/// </summary>
		public abstract string Id { get; }

		/// <summary>
		/// Name
		/// </summary>
		public abstract string Name { get; }

		/// <summary>
		/// Description
		/// </summary>
		public abstract string Description { get; }

		public static IEnumerable<T> GetAllInstances<T>() => Current.Factory.GetAllInstances(typeof(T)).Cast<T>();

		public static T GetInstance<T>(string id) => GetAllInstances<T>().FirstOrDefault(x => ((IDiscover)x).Id == id);

		T IDiscover.GetInstance<T>(string id) => DiscoverBase.GetInstance<T>(id);

		IEnumerable<T> IDiscover.GetAllInstances<T>() => DiscoverBase.GetAllInstances<T>();
	}
}
