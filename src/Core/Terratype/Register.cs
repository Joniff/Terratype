using System;
using System.Collections.Generic;
using System.Linq;
using Umbraco.Core;
using Umbraco.Core.Cache;
using Umbraco.Core.Sync;
using Umbraco.Web.Cache;

namespace Terratype
{
	public class Register : ApplicationEventHandler
	{
		private const int BatchSize = 1000;		//	Do republish all in batches
		private const int BatchSleep = 250;		//	How many millisecs we wait between batches

		private IEnumerable<Indexer.IndexerBase> Indexers;

		private bool? allow = null;
		private bool IsMaster = true;

		private bool AllowProcessing
		{
			get
			{
				if (allow != null)
				{
					return (bool) allow;
				}
				var registrar = ServerRegistrarResolver.Current.Registrar as IServerRegistrar2;
				if (registrar == null)
				{
					return true;		//	For now return that we allow processing until we know better
				}
				var role = registrar.GetCurrentServerRole();
				if (role == ServerRole.Unknown)
				{
					return true;		//	For now return that we allow processing until we know better
				}
				if (role == ServerRole.Slave)
				{
					IsMaster = false;
					allow = Indexers.Any(x => x.MasterOnly == false);
				}
				allow = true;
				return true;
			}
		}

		protected override void ApplicationStarting(UmbracoApplicationBase umbracoApplication, ApplicationContext applicationContext)
		{
			base.ApplicationStarting(umbracoApplication, applicationContext);
			Models.Position.RegisterType<Models.Position, CoordinateSystems.Bd09>(CoordinateSystems.Bd09._Id);
			Models.Position.RegisterType<Models.Position, CoordinateSystems.Gcj02>(CoordinateSystems.Gcj02._Id);
			Models.Position.RegisterType<Models.Position, CoordinateSystems.Wgs84>(CoordinateSystems.Wgs84._Id);
			Models.Label.RegisterType<Models.Label, Labels.Standard>(Labels.Standard._Id);
			Models.ColorFilter.RegisterType<Models.ColorFilter, ColorFilters.Sepia>(ColorFilters.Sepia._Id);
			Models.ColorFilter.RegisterType<Models.ColorFilter, ColorFilters.Sepia>(ColorFilters.Grayscale._Id);
			Models.ColorFilter.RegisterType<Models.ColorFilter, ColorFilters.Sepia>(ColorFilters.Colorscale._Id);
			Models.ColorFilter.RegisterType<Models.ColorFilter, ColorFilters.Sepia>(ColorFilters.HueRotate._Id);
			Models.ColorFilter.RegisterType<Models.ColorFilter, ColorFilters.Sepia>(ColorFilters.Invert._Id);
		}

		protected override void ApplicationStarted(UmbracoApplicationBase umbracoApplication, ApplicationContext applicationContext)
		{
			base.ApplicationStarted(umbracoApplication, applicationContext);
			if (Indexer.IndexerBase.InstalledTypes.Any())
			{
				Indexers = Indexer.IndexerBase.InstalledTypes.Select(x => Indexer.IndexerBase.Resolve(x));
				Umbraco.Core.Services.ContentService.Published += ContentService_Published;
				Umbraco.Core.Services.ContentService.UnPublished += ContentService_UnPublished;
				Umbraco.Core.Services.ContentService.Deleted += ContentService_Deleted;
				Umbraco.Core.Services.ContentService.Moved += ContentService_Moved;
				CacheRefresherBase<PageCacheRefresher>.CacheUpdated += ContentService_RepublishAll;
			}
		}

		private void ContentService_RepublishAll(PageCacheRefresher sender, CacheRefresherEventArgs e)
		{
			if (e.MessageType == MessageType.RefreshAll && AllowProcessing)
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

		private void Sync(IEnumerable<Guid> remove, IEnumerable<Umbraco.Core.Models.IContent> add)
		{
			IEnumerable<Indexer.Entry> entries = null;
			if (add != null && add.Any())
			{
				entries = new Indexer.ContentService().Entries(add);
			}

			if ((remove != null && remove.Any()) || (entries != null && entries.Any()))
			{
				foreach (var indexer in Indexers.Where(x => IsMaster || x.MasterOnly == false))
				{
					indexer.Sync(remove, entries);
				}
			}
		}

		private void ContentService_Published(Umbraco.Core.Publishing.IPublishingStrategy sender, 
			Umbraco.Core.Events.PublishEventArgs<Umbraco.Core.Models.IContent> contents)
		{
			if (AllowProcessing)
			{
				Sync(contents.PublishedEntities.Select(x => x.Key), contents.PublishedEntities);
			}
		}

		private void ContentService_UnPublished(Umbraco.Core.Publishing.IPublishingStrategy sender, 
			Umbraco.Core.Events.PublishEventArgs<Umbraco.Core.Models.IContent> contents)
		{
			if (AllowProcessing)
			{
				Sync(contents.PublishedEntities.Select(x => x.Key), null);
			}
		}

		private void ContentService_Deleted(Umbraco.Core.Services.IContentService sender, 
			Umbraco.Core.Events.DeleteEventArgs<Umbraco.Core.Models.IContent> e)
		{
			if (AllowProcessing)
			{
				Sync(e.DeletedEntities.Select(x => x.Key), null);
			}
		}

		private void ContentService_Moved(Umbraco.Core.Services.IContentService sender, 
			Umbraco.Core.Events.MoveEventArgs<Umbraco.Core.Models.IContent> e)
		{
			if (AllowProcessing)
			{
				Sync(e.MoveInfoCollection.Select(x => x.Entity.Key), e.MoveInfoCollection.Where(x => x.Entity.Published).Select(x => x.Entity));
			}
		}
	}
}
