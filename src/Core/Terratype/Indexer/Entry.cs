using System;
using System.Collections.Generic;
using System.Text;

namespace Terratype.Indexer
{
	public class Entry
	{
		private const char KeySeperator = '\x1f';

		public Guid Id { get; set; }

		public IEnumerable<Guid> Ancestors { get; set; }

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

		public Models.Map Map {get; set; }

		public Entry(Guid id, IEnumerable<Guid> ancestors, string key, Models.Map map)
		{
			Id = id;
			Key = key;
			Map = map;
			Ancestors = ancestors;
		}

		public Entry(Guid id, IEnumerable<Guid> ancestors, string[] keys, Models.Map map)
		{
			Id = id;
			Keys = keys;
			Map = map;
			Ancestors = ancestors;
		}

		public Entry(Guid id, IEnumerable<Guid> ancestors, IEnumerable<string> keys, Models.Map map)
		{
			Id = id;
			Keys = keys;
			Map = map;
			Ancestors = ancestors;
		}
	}
}
