using Semver;
using System;
using System.Linq;
using Umbraco.Core;
using Umbraco.Core.Logging;
using Umbraco.Core.Persistence.Migrations;
using Umbraco.Core.Persistence.SqlSyntax;
using Umbraco.Core.Services;

namespace Terratype.Indexer.Sql.Persistance.Data.Migrations
{
    internal class Migration
    {
        public static readonly SemVersion TargetVersion = new SemVersion(1, 0, 0);
        public const string ProductName = nameof(Terratype) + nameof(Indexer) + nameof(Sql);

        /// <summary>
        /// 
        /// </summary>
        /// <param name="sqlSyntax"></param>
        /// <param name="migrationEntryService"></param>
        /// <param name="logger"></param>
        public void RunMigrations(ISqlSyntaxProvider sqlSyntax, IMigrationEntryService migrationEntryService, ILogger logger)
        {
            var currentVersion = new SemVersion(0);
            var migrations = ApplicationContext.Current.Services.MigrationEntryService.GetAll(ProductName).OrderByDescending(x => x.CreateDate);
            var latestMigration = migrations.FirstOrDefault();

            if (latestMigration != null)
			{
                currentVersion = latestMigration.Version;
            }

            if (TargetVersion == currentVersion)
			{
                return;
			}

            IMigration[] scriptsForMigration =
            {
				(IMigration) new Versions.Migration100(sqlSyntax, logger)
            };

            MigrationRunner migrationsRunner = new MigrationRunner(migrationEntryService, logger, currentVersion, TargetVersion, 
            ProductName, scriptsForMigration);

            try
            {
                migrationsRunner.Execute(ApplicationContext.Current.DatabaseContext.Database);
            }
            catch (Exception ex)
            {
                LogHelper.Error<Migration>($"Error running {ProductName} migration", ex);
            }
        }
	}
}
