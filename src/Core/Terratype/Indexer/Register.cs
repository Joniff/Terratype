using System;
using System.Collections.Generic;
using System.Linq;
using Umbraco.Core;
using Umbraco.Core.Cache;
using Umbraco.Core.Composing;
using Umbraco.Core.Logging;
using Umbraco.Core.Services;
using Umbraco.Core.Sync;
using Umbraco.Web.Cache;


namespace Terratype.Indexer
{
	[RuntimeLevel(MinLevel = RuntimeLevel.Run)]
	public class Register : IComponent
	{
		private const int BatchSize = 1000;     //	Do republish all in batches
		private const int BatchSleep = 250;     //	How many millisecs we wait between batches
		private IEnumerable<IndexerBase> Indexers = null;
		private readonly IContentService ContentService;
		private ContentService IndexerContentService;

		public Register(IContentService contentService, IEntityService entityService, IDataTypeService dataTypeService, IContentTypeService contentTypeService, ILogger logger)
		{
			ContentService = contentService;
			IndexerContentService = new ContentService(entityService, contentService, dataTypeService, contentTypeService, logger);
		}

		public void Initialize()
		{
			var container = new LightInject.ServiceContainer();
			var server = container.GetInstance(typeof(IServerRegistrar)) as IServerRegistrar;
			if (server != null && server.GetCurrentServerRole() == ServerRole.Replica)
			{
				return;
			}
			Indexers = container.GetAllInstances(typeof(IndexerBase)).Cast<IndexerBase>();
			if (Indexers.Any())
			{
				Umbraco.Core.Services.Implement.ContentService.Published += ContentService_Published;
				Umbraco.Core.Services.Implement.ContentService.Unpublished += ContentService_Unpublished;
				Umbraco.Core.Services.Implement.ContentService.Deleted += ContentService_Deleted;
				Umbraco.Core.Services.Implement.ContentService.Moved += ContentService_Moved;
				ContentCacheRefresher.CacheUpdated += ContentCacheRefresher_CacheUpdated;
			}
		}

		public void Terminate()
		{
			// do something when Umbraco terminates
		}

		private void Sync(IEnumerable<Guid> remove, IEnumerable<Umbraco.Core.Models.IContent> add)
		{
			IEnumerable<Indexer.Entry> entries = null;
			if (add != null && add.Any())
			{
				entries = IndexerContentService.Entries(add);
			}

			if ((remove != null && remove.Any()) || (entries != null && entries.Any()))
			{
				foreach (var indexer in Indexers.Where(x => x.MasterOnly))
				{
					indexer.Sync(remove, entries);
				}
			}
		}

		private void ContentService_Published(Umbraco.Core.Services.IContentService sender, Umbraco.Core.Events.ContentPublishedEventArgs contents)
		{
			Sync(contents.PublishedEntities.Select(x => x.Key), contents.PublishedEntities);
		}

		private void ContentService_Unpublished(Umbraco.Core.Services.IContentService sender, Umbraco.Core.Events.PublishEventArgs<Umbraco.Core.Models.IContent> contents)
		{
			Sync(contents.PublishedEntities.Select(x => x.Key), null);
		}

		private void ContentService_Deleted(Umbraco.Core.Services.IContentService sender, Umbraco.Core.Events.DeleteEventArgs<Umbraco.Core.Models.IContent> contents)
		{
			Sync(contents.DeletedEntities.Select(x => x.Key), null);
		}

		private void ContentService_Moved(Umbraco.Core.Services.IContentService sender, Umbraco.Core.Events.MoveEventArgs<Umbraco.Core.Models.IContent> contents)
		{
			Sync(contents.MoveInfoCollection.Select(x => x.Entity.Key), contents.MoveInfoCollection.Where(x => x.Entity.Published).Select(x => x.Entity));
		}


		private void ContentCacheRefresher_CacheUpdated(ContentCacheRefresher sender, CacheRefresherEventArgs e)
		{
			if (e.MessageType == MessageType.RefreshAll)
			{
				var contents = new Stack<Umbraco.Core.Models.IContent>();
				var found = new List<Umbraco.Core.Models.IContent>();

				foreach (var content in ContentService.GetRootContent())
				{
					if (content.Published)
					{
						contents.Push(content);
					}
				}

				while (contents.Count != 0)
				{
					var content = contents.Pop();
					long totalChildren = 0;
					foreach (var child in ContentService.GetPagedChildren(content.Id, 0, int.MaxValue, out totalChildren))
					{
						if (child.Published)
						{
							contents.Push(child);
						}
					}
					found.Add(content);
					if (found.Count == BatchSize)
					{
						Sync(found.Select(x => x.Key), found);
						found.Clear();
						System.Threading.Thread.Sleep(BatchSleep);
					}
				}

				Sync(found.Select(x => x.Key), found);

			}
		}
	}
}
