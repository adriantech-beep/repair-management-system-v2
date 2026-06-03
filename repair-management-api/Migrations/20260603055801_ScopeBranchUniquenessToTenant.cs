using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace repair_management_api.Migrations
{
    /// <inheritdoc />
    public partial class ScopeBranchUniquenessToTenant : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Branches_Code",
                table: "Branches");

            migrationBuilder.DropIndex(
                name: "IX_Branches_Name",
                table: "Branches");

            migrationBuilder.CreateIndex(
                name: "IX_Branches_TenantId_Code",
                table: "Branches",
                columns: new[] { "TenantId", "Code" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Branches_TenantId_Name",
                table: "Branches",
                columns: new[] { "TenantId", "Name" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Branches_TenantId_Code",
                table: "Branches");

            migrationBuilder.DropIndex(
                name: "IX_Branches_TenantId_Name",
                table: "Branches");

            migrationBuilder.CreateIndex(
                name: "IX_Branches_Code",
                table: "Branches",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Branches_Name",
                table: "Branches",
                column: "Name",
                unique: true);
        }
    }
}
