using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Terratype.Indexer
{
	public class Entry
	{
		private const char KeySeperator = '\x1f';

		public IEnumerable<string> Ancestors { get; set; }

		public string Key { get; set;}

		public IEnumerable<string> Keys 
		{ 
			get
			{
				return Key.Split(KeySeperator);
			}
			set
			{
				var builder = new StringBuilder();
				foreach (var key in value)
				{
					if (builder.Length != 0)
					{
						builder.Append(KeySeperator);
					}

					builder.Append(key);
				}
				Key = builder.ToString();
			}
		}

		public Models.Model Map {get; set; }

		public Entry(string key, IEnumerable<string> ancestors, Models.Model map)
		{
			Key = key;
			Map = map;
			Ancestors = ancestors;
		}

		public Entry(string[] keys, IEnumerable<string> ancestors, Models.Model map)
		{
			Keys = keys;
			Map = map;
			Ancestors = ancestors;
		}

		public Entry(IEnumerable<string> keys, IEnumerable<string> ancestors, Models.Model map)
		{
			Keys = keys;
			Map = map;
			Ancestors = ancestors;
		}
	}
}
