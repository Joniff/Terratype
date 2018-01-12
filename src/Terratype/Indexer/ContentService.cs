using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Terratype.Indexer
{
	public class ContentService
	{
		private Terratype.Models.Indexer Indexer;

		public ContentService(Terratype.Models.Indexer indexer)
		{
			Indexer = indexer;
		}

		private IDictionary<string, Terratype.Models.Model> Find(Umbraco.Core.Models.IContent content)
		{
			



			return null;
		}

		private string Identity(Umbraco.Core.Models.IContent content)
		{
			if (content.HasIdentity)
			{
				return content.Key.ToString();
			}
			return content.Path + "|" + content.SortOrder.ToString() + "|" + content.Name + "|" + content.CreateDate.Ticks.ToString();
		}

		private IEnumerable<string> Ancestors(Umbraco.Core.Models.IContent content)
		{
			return content.Path.Split(new char[] {','});
		}

		public void Save(Umbraco.Core.Models.IContent content)
		{
			var found = Find(content);
			if (!found.Any())
			{
				return;
			}

			string id = Identity(content);
			var ancestors = Ancestors(content);
			foreach (var model in Find(content))
			{
				Indexer.Add(id + model.Key, model.Value, ancestors);
			}
		}

		public void Delete(Umbraco.Core.Models.IContent content)
		{
			var found = Find(content);
			if (!found.Any())
			{
				return;
			}

			string id = Identity(content);
			var ancestors = Ancestors(content);
			foreach (var model in Find(content))
			{
				Indexer.Delete(id + model.Key);
			}
		}
	}
}
