using System.Collections.Generic;

namespace Terratype.Indexer
{
	public class Results : Dictionary<string, Models.Model>
	{
		private const string KeySeperator = "\x1f";

		public void Add(string[] keys, Models.Model model)
		{
			this.Add(string.Join(KeySeperator, keys), model);
		}

		public void Add(List<string> keys, Models.Model model)
		{
			this.Add(string.Join(KeySeperator, keys), model);
		}
	}
}
