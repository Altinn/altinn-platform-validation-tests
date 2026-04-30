/*
Copyright © 2026 NAME HERE <EMAIL ADDRESS>
*/
package cmd

import (
	"fmt"
	"log"
	"os"
	"os/exec"
	"strings"

	"github.com/spf13/cobra"
	"go.yaml.in/yaml/v4"
)

// boilerplateCmd represents the boilerplate command
var boilerplateCmd = &cobra.Command{
	Use:   "boilerplate",
	Short: "A brief description of your command",
	Long: `A longer description that spans multiple lines and likely contains examples
and usage of using your command. For example:

Cobra is a CLI library for Go that empowers applications.
This application is a tool to generate the needed files
to quickly create a Cobra application.`,
	Run: func(cmd *cobra.Command, args []string) {
		fmt.Println("boilerplate called")
		generateBreakpointCronjobs()
	},
}

func init() {
	rootCmd.AddCommand(boilerplateCmd)

	// Here you will define your flags and configuration settings.

	// Cobra supports Persistent Flags which will work for this command
	// and all subcommands, e.g.:
	// boilerplateCmd.PersistentFlags().String("foo", "", "A help for foo")

	// Cobra supports local flags which will only run when this command
	// is called directly, e.g.:
	// boilerplateCmd.Flags().BoolP("toggle", "t", false, "Help message for toggle")
}

func generateBreakpointCronjobs() {
	yfile, err := os.ReadFile("/tmp/altinn-platform-validation-tests/hack/breakpoint-schedule.yml")
	if err != nil {
		log.Fatal(err)
	}
	cf := []Scheduling{}
	err = yaml.Unmarshal(yfile, &cf)
	if err != nil {
		log.Fatalf("error: %v", err)
	}
	// fmt.Println(cf)
	for _, s := range cf {
		var errb strings.Builder
		cmd := exec.Command("jsonnet",
			"--ext-str", fmt.Sprintf("config_file=%s", s.ConfigFile),
			"--ext-str", fmt.Sprintf("namespace=%s", "authentication"),
			"--ext-str", fmt.Sprintf("cron_schedule=%s", s.Schedule[0].CronExpression),
			"--multi", "/tmp/altinn-platform-validation-tests/cli/ops-cli/",
			"/tmp/altinn-platform-validation-tests/hack/cronjob-breakpoint.jsonnet")
		cmd.Stderr = &errb
		err = cmd.Run()
		if err != nil {
			fmt.Printf("Failed to generate resources via Jsonnet\nerr:%s", errb.String())
			os.Exit(1)
		}
	}

}

type Scheduling struct {
	ConfigFile string     `yaml:"config_file"`
	Schedule   []Schedule `yaml:"schedule"`
}

type Schedule struct {
	TestId         string `yaml:"testid"`
	CronExpression string `yaml:"cron_expression"`
}
