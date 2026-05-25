using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace repair_management_api.Migrations
{
    /// <inheritdoc />
    public partial class AddAssignedTechnicianToRepairJob : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "AssignedTechnicianId",
                table: "RepairJobs",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_RepairJobs_AssignedTechnicianId",
                table: "RepairJobs",
                column: "AssignedTechnicianId");

            migrationBuilder.AddForeignKey(
                name: "FK_RepairJobs_Users_AssignedTechnicianId",
                table: "RepairJobs",
                column: "AssignedTechnicianId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_RepairJobs_Users_AssignedTechnicianId",
                table: "RepairJobs");

            migrationBuilder.DropIndex(
                name: "IX_RepairJobs_AssignedTechnicianId",
                table: "RepairJobs");

            migrationBuilder.DropColumn(
                name: "AssignedTechnicianId",
                table: "RepairJobs");
        }
    }
}
