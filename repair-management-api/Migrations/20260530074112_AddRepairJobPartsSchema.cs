using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace repair_management_api.Migrations
{
    /// <inheritdoc />
    public partial class AddRepairJobPartsSchema : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "RepairJobParts",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    RepairJobId = table.Column<Guid>(type: "uuid", nullable: false),
                    PartId = table.Column<Guid>(type: "uuid", nullable: false),
                    Quantity = table.Column<int>(type: "integer", nullable: false),
                    UnitPrice = table.Column<decimal>(type: "numeric", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    AllocatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RepairJobParts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RepairJobParts_Parts_PartId",
                        column: x => x.PartId,
                        principalTable: "Parts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_RepairJobParts_RepairJobs_RepairJobId",
                        column: x => x.RepairJobId,
                        principalTable: "RepairJobs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_RepairJobParts_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_RepairJobParts_PartId",
                table: "RepairJobParts",
                column: "PartId");

            migrationBuilder.CreateIndex(
                name: "IX_RepairJobParts_RepairJobId",
                table: "RepairJobParts",
                column: "RepairJobId");

            migrationBuilder.CreateIndex(
                name: "IX_RepairJobParts_TenantId",
                table: "RepairJobParts",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_RepairJobParts_TenantId_RepairJobId",
                table: "RepairJobParts",
                columns: new[] { "TenantId", "RepairJobId" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "RepairJobParts");
        }
    }
}
