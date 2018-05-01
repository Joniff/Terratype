using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Umbraco.Core.Persistence;

namespace Terratype.Indexer.Sql.Persistance.Data.Dto
{
	internal class Ancestor : Migrations.Dto.Ancestor.Ancestor100
	{
        [Ignore]
        public IEnumerable<Entry> Entries { get; set; }
	}
}

