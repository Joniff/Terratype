using System;
using System.Collections.Generic;
using System.Linq;
using Umbraco.Core;
using Umbraco.Core.Cache;
using Umbraco.Core.Composing;
using Umbraco.Core.Sync;
using Umbraco.Web.Cache;
using Umbraco.Core.Services.Implement;
using Terratype.Indexer;

namespace Terratype
{
	[RuntimeLevel(MinLevel = RuntimeLevel.Run)]
	public class Register : IUserComposer, IComponent
	{
		private const int BatchSize = 1000;     //	Do republish all in batches
		private const int BatchSleep = 250;     //	How many millisecs we wait between batches
		private IEnumerable<IndexerBase> Indexers = null;

		public void Compose(Composition composition)
		{
			var container = new LightInject.ServiceContainer();
			container.Register<Models.Position, CoordinateSystems.Bd09>(CoordinateSystems.Bd09._Id);
			container.Register<Models.Position, CoordinateSystems.Gcj02>(CoordinateSystems.Gcj02._Id);
			container.Register<Models.Position, CoordinateSystems.Wgs84>(CoordinateSystems.Wgs84._Id);

			container.Register<Models.Label, Labels.Standard>(Labels.Standard._Id);

			container.Register<Models.ColorFilter, ColorFilters.Sepia>(ColorFilters.Sepia._Id);
			container.Register<Models.ColorFilter, ColorFilters.Colorscale>(ColorFilters.Colorscale._Id);
			container.Register<Models.ColorFilter, ColorFilters.Grayscale>(ColorFilters.Grayscale._Id);
			container.Register<Models.ColorFilter, ColorFilters.HueRotate>(ColorFilters.HueRotate._Id);
			container.Register<Models.ColorFilter, ColorFilters.Invert>(ColorFilters.Invert._Id);
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

		private void ContentService_Moved1(Umbraco.Core.Services.IContentService sender, Umbraco.Core.Events.MoveEventArgs<Umbraco.Core.Models.IContent> e)
		{
			throw new NotImplementedException();
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
				entries = new Indexer.ContentService().Entries(add);
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
				var contentService = ApplicationContext.Current.Services.ContentService;
				var found = new List<Umbraco.Core.Models.IContent>();

				foreach (var content in contentService.GetChildren(Umbraco.Core.Constants.System.Root))
				{
					if (content.Published)
					{
						contents.Push(content);
					}
				}

				while (contents.Count != 0)
				{
					var content = contents.Pop();
					foreach (var child in contentService.GetChildren(content.Id))
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
